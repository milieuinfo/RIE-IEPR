@Library('Cumulus@1.2-stable') _

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

pipeline {

  agent {
    kubernetes {
      inheritFrom 'jenkins-jenkins-agent'
      yaml podBuilder.from([dind.podSpec(), nodePodSpec])
    }
  }

  environment {
    GH_PAGES_BRANCH         = 'gh-pages'
    GITHUB_REPO             = 'milieuinfo/RIE-IEPR'
  }

  stages {

    stage('CI') {
      stages {

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

        stage('Deploy docs to GitHub Pages') {
          when {
            branch 'main'
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

                    # schema TTL en SHACL cache
                    for f in riepr-ontologie.ttl riepr-concept.ttl generated-shapes.ttl validation-report.json; do
                      if [ -f "../build-artifact/$f" ]; then
                        cp -f "../build-artifact/$f" "$f"
                      fi
                    done

                    touch .nojekyll
                    git add index.html visualisatie.html .nojekyll riepr-ontologie.ttl riepr-concept.ttl generated-shapes.ttl validation-report.json
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
}
