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
                bat 'mvn -version'
                bat 'node -v'
                bat 'npm -v'
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
                    bat 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                dir('shopfloor-backend') {
                    bat 'mvn test'
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
}