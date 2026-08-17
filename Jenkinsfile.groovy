@Library('Cumulus@1.3-stable') _

def nodePodSpec = '''
spec:
  containers:
    - name: node
      image: acd-docker.repository.milieuinfo.be/library/node:20-alpine
      command:
        - cat
      tty: true
      resources:
        requests:
          memory: "512Mi"
          cpu: "250m"
        limits:
          memory: "2Gi"
'''

def pythonPodSpec = '''
spec:
  containers:
    - name: python
      image: acd-docker.repository.milieuinfo.be/library/python:3.11-slim
      command:
        - cat
      tty: true
      resources:
        requests:
          memory: "512Mi"
          cpu: "250m"
        limits:
          memory: "2Gi"
'''

pipeline {

  agent {
    kubernetes {
      inheritFrom 'jenkins-jenkins-agent'
      yaml podBuilder.from([maven.podSpec(25), dind.podSpec(), sonar, trivy, nodePodSpec, pythonPodSpec])
    }
  }

  environment {
    SONAR_PROJECT_KEY = 'be.vlaanderen.omgeving:riepr'
    GH_PAGES_BRANCH    = 'gh-pages'
    GITHUB_REPO        = 'milieuinfo/RIE-IEPR'
  }

  stages {

    stage("Setup") {
      steps {
        script {
          if (env.BRANCH_IS_PRIMARY) {
            properties([versions.releaseParameters()])
            def currentVersion = maven.version()
            if (versions.isRelease()) {
              def version = versions.bump(currentVersion)
              git.validateTag(version)
              maven.validateVersion(version)
              env.VERSION = version
            }
          } else {
            properties([parameters([
                booleanParam(name: 'DEPLOY', defaultValue: false, description: 'If true, runs mvn deploy instead of mvn verify.')
            ])])
          }
        }
      }
    }

    stage('Build Specificatie') {
      steps {
        container('node') {
          sh '''
            set -e
            export NPM_CONFIG_LOGLEVEL=warn
            export PUPPETEER_SKIP_DOWNLOAD=true
            export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
            # run in the specificatie subfolder where package.json lives
            cd documentatie/bin/specificatie
              if [ -f package-lock.json ]; then
                npm ci --no-audit --no-fund || exit 1
              else
                npm install --no-audit --no-fund --no-optional || exit 1
              fi
              npm run generate:bikeshed
          '''
        }

        container('dind') {
          sh '''
            set -e

            # build:docker expects Docker on the host
            if command -v docker >/dev/null 2>&1; then
              (cd documentatie/bin/specificatie && docker build -t specificatie:latest . && docker run -v "$PWD":/app specificatie:latest) || true
            else
              echo "docker is not available in this container; skipping build:docker"
            fi

            # ensure artifact folder exists even when generation failed
            mkdir -p build-artifact
            if [ -f documentatie/bin/specificatie/index.html ]; then
              cp -f documentatie/bin/specificatie/index.html build-artifact/
            fi
            if [ -f documentatie/bin/visualisatie/index.html ]; then
              cp -f documentatie/bin/visualisatie/index.html build-artifact/visualisatie.html
            fi

            # schema TTL en SHACL cache meepubliceren naast de visualisatie
            for f in riepr-ontologie.ttl riepr-concept.ttl generated-shapes.ttl validation-report.json; do
              if [ -f "documentatie/bin/visualisatie/$f" ]; then
                cp -f "documentatie/bin/visualisatie/$f" "build-artifact/$f"
              fi
            done

            echo "Build and package stage completed."
          '''
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'build-artifact/**', allowEmptyArchive: true, fingerprint: true
        }
      }
    }

    stage('Build Widoco & MkDocs') {
      steps {
        container('python') {
          sh '''
            set -e
            cd documentatie/datamodel
            bash build-mkdocs.sh
          '''
        }
        container('dind') {
          sh '''
            set -e
            mkdir -p site/combined
            # combine mkdocs site with widoco ontologie already copied into mkdocs
            if [ -d site/mkdocs ]; then
              cp -r site/mkdocs/* site/combined/
            fi
            # ensure ontologie folder is present
            if [ -d site/mkdocs/ontologie ]; then
              mkdir -p site/combined/ontologie
              cp -r site/mkdocs/ontologie/* site/combined/ontologie/
            fi
            # create build artifact for docs
            mkdir -p build-artifact/docs
            cp -r site/combined/* build-artifact/docs/
            # simple index redirect
            echo '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=docs/index.html" /></head><body>Redirecting...</body></html>' > build-artifact/index.html
          '''
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'build-artifact/**', allowEmptyArchive: true, fingerprint: true
        }
      }
    }

    stage("Non-primary branch") {
      when {
        allOf {
          not { expression { env.BRANCH_IS_PRIMARY } }
          expression { git.notSkipCi() }
        }
      }
      parallel {
        stage("Trivy scan") {
          steps {
            script {
              trivy.scanFilesystem([targetPath: 'pom.xml'])
            }
          }
        }
        stage("Maven verify") {
          when {
            expression { !(params.DEPLOY ?: false) }
          }
          steps {
            script {
              maven.goal([goal: 'verify'])
            }
          }
        }
        stage("Maven deploy") {
          when {
            expression { params.DEPLOY ?: false }
          }
          steps {
            script {
              maven.goal([goal: 'deploy'])
            }
          }
        }
      }
    }

    stage("Primary branch") {
      when {
        allOf {
          expression { env.BRANCH_IS_PRIMARY }
          expression { git.notSkipCi() }
        }
      }
      stages {
        stage("Reset workspace") {
          steps {
            container('jnlp') {
              sh '''
                # Build Specificatie regenereert gecommitte bestanden (bv. ontologie.bs);
                # release:prepare weigert te starten met vuile working tree.
                git checkout -- . || true
              '''
            }
          }
        }
        stage("Maven prepare") {
          when {
            expression { versions.isRelease() }
          }
          steps {
            script {
              maven.goal([goal     : 'release:clean release:prepare',
                          version  : env.VERSION,
                          skipTests: true
              ])
            }
          }
        }
        stage("Maven deploy") {
          when {
            expression { !versions.isRelease() }
          }
          steps {
            script {
              maven.goal([goal: 'deploy'])
            }
          }
        }
        stage("Sonar scan") {
          steps {
            script {
              sonar.scanMaven([
                      projectKey        : env.SONAR_PROJECT_KEY,
                      tolerateBadQuality: true
              ])
            }
          }
        }
        stage("Maven release") {
          when {
            expression { versions.isRelease() }
          }
          steps {
            script {
              maven.goal([goal     : 'release:perform',
                          version  : env.VERSION,
                          skipTests: true
              ])
            }
          }
        }

        stage('Deploy docs to GitHub Pages') {
          steps {
            container('jnlp') {
              script {
                git.withGitAuth {
                  sh '''
                    set -e
                    rm -rf .gh-pages-deploy
                    git clone --depth 1 --branch "$GH_PAGES_BRANCH" "https://github.com/${GITHUB_REPO}.git" .gh-pages-deploy \
                        || git clone --depth 1 "https://github.com/${GITHUB_REPO}.git" .gh-pages-deploy

                    cd .gh-pages-deploy
                    git checkout -B "$GH_PAGES_BRANCH"
                    find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

                    # copy site files from build artifact
                    if [ -f ../build-artifact/index.html ]; then
                      cp -f ../build-artifact/index.html index.html
                    fi
                    if [ -f ../build-artifact/visualisatie.html ]; then
                      cp -f ../build-artifact/visualisatie.html visualisatie.html
                    fi
                    # copy MkDocs + Widoco site
                    if [ -d ../build-artifact/docs ]; then
                      cp -r ../build-artifact/docs/* .
                    fi

                    # schema TTL en SHACL cache
                    for f in riepr-ontologie.ttl riepr-concept.ttl generated-shapes.ttl validation-report.json; do
                      if [ -f "../build-artifact/$f" ]; then
                        cp -f "../build-artifact/$f" "$f"
                      fi
                    done

                    touch .nojekyll
                    git add .nojekyll index.html visualisatie.html riepr-ontologie.ttl riepr-concept.ttl generated-shapes.ttl validation-report.json
                    # add all files from docs deploy
                    if [ -d ../build-artifact/docs ]; then
                      find . -type f ! -name '.git*' -exec git add {} +
                    fi
                    if ! git diff --cached --quiet; then
                      git config user.email "$GIT_USER_EMAIL"
                      git config user.name "$GIT_USER_NAME"
                      git commit -m "docs: deploy from ${BUILD_TAG}"
                      git push origin "$GH_PAGES_BRANCH"
                    else
                      echo "No changes to deploy"
                    fi
                  '''
                }
              }
            }
          }
        }
      }
    }

    stage('Verify Release') {
      when {
        branch 'main'
      }
      steps {
        container('jnlp') {
          sh '''
            set -e
            git config --global init.defaultBranch main || true
            if ! git ls-remote --heads "https://github.com/${GITHUB_REPO}.git" gh-pages | grep refs/heads/gh-pages; then
              echo "gh-pages branch missing"
              exit 1
            fi
            echo "gh-pages branch verified successfully"
          '''
        }
      }
    }
  }

  post {
    always {
      script {
        pipelineSummary([sonarProjectKey: env.BRANCH_IS_PRIMARY ? env.SONAR_PROJECT_KEY : null])
      }
    }
  }
}
