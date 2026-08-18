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
      env:
        - name: ARTIFACTORY_USER
          value: "jenkins-systeemgebruiker"
        - name: ARTIFACTORY_PASSWORD
          valueFrom:
            secretKeyRef:
              key: "artifactory_password"
              name: "jenkins-secrets"
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

    stage('Build Widoco & MkDocs') {
      steps {
        container('maven') {
          sh '''
            set -e
            ROOT="$(pwd)"

            # find a pypi repo that actually contains the packages
            PYPY_REPO="pypi"
            for repo in pypi pypi-virtual pypi-local; do
              if curl -s --netrc -o /dev/null -w "%{http_code}" --max-time 20 "https://repo.omgeving.vlaanderen.be/artifactory/api/pypi/$repo/simple/mkdocs/" 2>/dev/null | grep -q "200"; then
                PYPY_REPO="$repo"
                break
              fi
            done
            echo "Using Artifactory pypi repo: $PYPY_REPO"

            # pip config for Artifactory (credentials from env, written to file to avoid logging)
            printf '[global]\nindex-url = https://%s:%s@repo.omgeving.vlaanderen.be/artifactory/api/pypi/%s/simple\n' "$bamboo_artifactory_ro_user" "$bamboo_artifactory_ro_password" "$PYPY_REPO" > "$ROOT/.pip-artifactory.conf"
            trap 'rm -f "$ROOT/.pip-artifactory.conf"' EXIT

            # The python pod container has no network, so python steps run in a
            # python image via the dind daemon (shares the maven pod network).
            docker_run() {
              docker run --rm \
                -v "$ROOT":/workspace \
                -w /workspace \
                -v "$ROOT/.pip-artifactory.conf":/tmp/pip-artifactory.conf:ro \
                -e PIP_CONFIG_FILE=/tmp/pip-artifactory.conf \
                -e PIP_TRUSTED_HOST=repo.omgeving.vlaanderen.be \
                -e PIP_DISABLE_PIP_VERSION_CHECK=1 \
                acd-docker.repository.milieuinfo.be/library/python:3.11-slim \
                "$@"
            }

            # preprocess ontology for Widoco (strips owl:Restriction blocks OWLAPI cannot parse)
            docker_run sh -c "pip install -q --break-system-packages rdflib && python3 documentatie/datamodel/prepare-widoco.py"

            bash "$ROOT/documentatie/datamodel/build-widoco.sh"

            # build the MkDocs site
            docker_run bash documentatie/datamodel/build-mkdocs.sh
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
              if [ "$(ls -A site/mkdocs/ontologie 2>/dev/null)" ]; then
                cp -r site/mkdocs/ontologie/* site/combined/ontologie/
              else
                echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ontologie</title></head><body><h1>Ontologie documentatie wordt gegenereerd</h1></body></html>' > site/combined/ontologie/index.html
              fi
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

    stage('Deploy docs to GitHub Pages') {
      when {
        allOf {
          expression { env.BRANCH_IS_PRIMARY }
          expression { git.notSkipCi() }
        }
      }
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
                git add .nojekyll index.html
                [ -f visualisatie.html ] && git add visualisatie.html || true
                [ -f riepr-ontologie.ttl ] && git add riepr-ontologie.ttl || true
                [ -f riepr-concept.ttl ] && git add riepr-concept.ttl || true
                [ -f generated-shapes.ttl ] && git add generated-shapes.ttl || true
                [ -f validation-report.json ] && git add validation-report.json || true
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
