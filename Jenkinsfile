pipeline {
    agent any

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Environment') {
            steps {
                bat 'java -version'
                bat 'node -v'
                bat 'npm -v'
            }
        }

        stage('Check Maven Directly') {
            steps {
                bat '"C:\\Users\\abhis\\apache-maven-3.9.16\\bin\\mvn.cmd" -version'
            }
        }

        stage('Install Angular Dependencies') {
            steps {
                dir('shopfloor-angular') {
                    bat 'npm install'
                }
            }
        }

        stage('Build Angular') {
            steps {
                dir('shopfloor-angular') {
                    bat 'npm run build'
                }
            }
        }

        stage('Build Spring Boot') {
            steps {
                dir('shopfloor-backend') {
                    bat '"C:\\Users\\abhis\\apache-maven-3.9.16\\bin\\mvn.cmd" clean package -DskipTests'
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                dir('shopfloor-backend') {
                    bat '"C:\\Users\\abhis\\apache-maven-3.9.16\\bin\\mvn.cmd" test'
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'shopfloor-backend/target/*.jar'
                archiveArtifacts artifacts: 'shopfloor-angular/dist/**/*'
            }
        }
    }

    post {
        success {
            echo 'BUILD SUCCESS ✔'
        }
        failure {
            echo 'BUILD FAILED ❌'
        }
        always {
            cleanWs()
        }
    }
}