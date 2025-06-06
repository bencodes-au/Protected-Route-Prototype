# Protected-Route-Prototype
# Summary
This application is a prototype for a protected route. This MERN stack was first built to demonstrate how a beginner developer can implement authorisation into their project, quickly and safely. Over time I have used this project as the basis of other learning. It has since been containerised, then had a local testing suite built on Github actions, and now has a complete CI/CD pipeline hosted with AWS Fargate.

This deployment can currently be seen at: http://13.210.246.184:3001/
(*This may be taken down in time to prevent AWS charges*)

# Automation Workflow
Automation is crucial to modern DevOps practices. With applications growing in complexity, it is essential to streamline deployment pipelines to achieve speed, reliability, and scalability. This implementation of such a pipeline uses a MERN stack application, Docker, AWS Fargate, and GitHub Actions. At the heart of this system lies an automation workflow defined in a YAML file deploy-to-ecs.yml which handles the building and deployment of the application. 

The deploy-to-ecs.yml file represents a fully automated CI/CD workflow that transforms a code push into a live deployment without human intervention. This workflow has a few main purposes. It establishes continuous delivery via pushes to the main branch automatically building, running tests and deploying the latest application state. It uses containers for both stacks to make deployment more consistent across environments. It is also deployed to AWS Fargate allowing resources to scale without managing servers. By unifying code, configuration, and infrastructure under one automation script, this workflow ensures that deployments are reliable in an easy to reproduce way. 

This workflow demonstrates several fundamental automation principles:
- Event Driven CI/CD triggered by Github push events
- Infrastructure as code via ECS task definitions and Dockerfiles
- Immutable Deployments via Docker Images built and tagged per commit or branch
- Secure Credentials via Github secrets
- Separation of Deployments via backend and front end being deployed separately but remaining within the same pipeline. 

### 1. Triggering the Workflow
The workflow is initiated on any push event to the main branch. This ensures that only production-ready code is merged into the main branch. This step triggers the deployment process.
```
on:
  push:
    branches:
      - main
```      

To improve automation flexibility and reliability, two advanced CI/CD triggers were added:
- Manual Trigger (workflow_dispatch): This enables on-demand deployments directly from the GitHub Actions UI. It includes an optional input field to specify the environment, which defaults to "production" if not set. This is useful for ad hoc testing, hotfixes, or re-deployments without needing to push a commit.

- Scheduled Trigger (cron): A schedule was implemented using cron syntax to automatically trigger the deployment every Monday at 10:00 AM. This ensures consistent and regular updates are pushed to production without manual intervention.

```
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: false
        default: 'production'


  schedule:
    - cron: "0 23 * * 0"
```

### 2. Workflow Environment and Runner
The workflow runs on GitHub-hosted Ubuntu machines. Additionally, it specifies an environment label (production), enabling GitHub’s environment protection rules and secrets management.
```
runs-on: ubuntu-latest
```

### 3. Source Code Checkout
This step retrieves the latest codebase from the GitHub repository for the runner to operate on.
```
- name: Checkout code
  uses: actions/checkout@v3
```  
### 4. AWS Credentials Configuration
This authenticates the GitHub Actions with AWS, using secure credentials stored in GitHub Secrets. It grants permission to interact with ECR, ECS, and other AWS services
```
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v2
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ secrets.AWS_REGION }}
```
### 5. Amazon ECR Login
This command allows the Docker CLI to push images to AWS ECR, a private container registry service.
```
- name: Login to Amazon ECR
  uses: aws-actions/amazon-ecr-login@v1
```

### 6. Environment Variable Setup
This step dynamically sets the container image URIs for both the frontend and backend using GitHub’s environment variable feature. These values are later used to tag and deploy containers.

```
- name: Set environment variables
  run: |
    echo "AWS_ACCOUNT_ID=${{ secrets.AWS_ACCOUNT_ID }}" >> $GITHUB_ENV
```
### 7. Docker Image Build and Push
These steps build and push separate Docker containers for the application’s two components. Keeping these separate is important in certain architectures and enables independent scaling.
Frontend:
```
- name: Build, tag, and push frontend Docker image
  run: |
    docker build -f Dockerfile.frontend -t frontend .
    docker tag frontend:latest $FRONTEND_IMAGE
    docker push $FRONTEND_IMAGE
```

Backend:
```
- name: Build, tag, and push backend Docker image
  run: |
    docker build -f Dockerfile.backend -t backend .
    docker tag backend:latest $BACKEND_IMAGE
    docker push $BACKEND_IMAGE
```

### 8. ECS Task Definition Templating
Before deploying, the workflow substitutes the IMAGE_PLACEHOLDER string in ECS task definition templates with actual image URIs. This keeps the deployment infrastructure decoupled from static image references.
```
- name: Update backend task definition with new image
  run: |
    sed "s|IMAGE_PLACEHOLDER|$BACKEND_IMAGE|" ecs-task-def-backend.template.json > ecs-task-def-backend.json
```

### 9. Deploying to AWS Fargate
Both components are deployed as separate ECS services under the same cluster. ECS manages scheduling and running the tasks on Fargate infrastructure, removing the need for EC2 instances or Kubernetes clusters.
Backend Deployment:
```
- name: Deploy backend to ECS
  uses: aws-actions/amazon-ecs-deploy-task-definition@v1
  with:
    task-definition: ecs-task-def-backend.json
    service: ${{ secrets.ECS_BACKEND_SERVICE_NAME }}
    cluster: ${{ secrets.ECS_CLUSTER_NAME }}
    wait-for-service-stability: true
```

Frontend Deployment:
```
- name: Deploy frontend to ECS
  uses: aws-actions/amazon-ecs-deploy-task-definition@v1
  with:
    task-definition: ecs-task-def-frontend.json
    service: ${{ secrets.ECS_FRONTEND_SERVICE_NAME }}
    cluster: ${{ secrets.ECS_CLUSTER_NAME }}
    wait-for-service-stability: true
```

# Task Definitions (Infrastructure as Code)
In cloud-native systems using container tools like Amazon ECS, task definitions are vital configuration blueprints that describe how to deploy and manage containerized services. ecs-task-def-backend.template.json and ecs-task-def-frontend.template.json define how the backend and frontend containers of a MERN stack application are deployed on AWS Fargate. They encode infrastructure state, environment variables, networking settings, and logging policies.

An ECS task definition is a JSON or YAML document that specifies how containers should be launched in the context of a service or task in ECS (Elastic Container Service). Each task definition includes information about, container image and configuration, CPU and memory allocation, network and port mappings, logging settings, IAM roles, IAM secrets and compatibility with launch types. These definitions are versioned and can be updated without altering services directly, making them ideal for automation and repeatable deployments.

By defining task definitions as templates, your workflow gains several advantages. The ECS task definition is versioned and stored alongside code but updated dynamically via CI/CD. Each deployment uses a new image preventing stale code causing issues. These templates can also be applied across environments via staging parameters. Combined with Github actions, these templates are easily scripted for automated deployments. 

## The Backend Task Definition (ecs-task-def-backend.template.json)
### Core Details
This configuration establishes the "protected-route-backend" as a Fargate-compatible task family using awsvpc mode for networking. This means each task gets its own ENI (Elastic Network Interface), allowing it to be addressable like a virtual machine.
```
{
  "family": "protected-route-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  ...
}
```
### Container Settings:
The "image" field is intentionally templated as "IMAGE_PLACEHOLDER" so that the GitHub Actions workflow can replace it dynamically during deployment. This supports immutable infrastructure, where each new version of the backend is a new Docker image tagged and deployed through CI/CD. The backend runs on port 3000 and is considered "essential": true, meaning ECS will consider the task unhealthy if this container exits or crashes.
```
"containerDefinitions": [
  {
    "name": "backend",
    "image": "IMAGE_PLACEHOLDER",
    "portMappings": [
      {
        "containerPort": 3000,
        "hostPort": 3000,
        "protocol": "tcp"
      }
    ],
    ...
  }
]
```

### Environment and Logging:
The container is configured for production with environment variables. Logs are centralized using the AWS CloudWatch Logs driver, which enables observability and debugging of runtime behavior.
```
"environment": [
  { "name": "NODE_ENV", "value": "production" },
  { "name": "PORT", "value": "3000" }
],
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/protected-route-backend",
    "awslogs-region": "ap-southeast-2",
    "awslogs-stream-prefix": "ecs"
  }
}
```

## The Frontend Task Definition (ecs-task-def-frontend.template.json)

### Core Details
This template serves a similar purpose but is tuned for the frontend React/Vite application. The frontend task uses half the CPU and memory of the backend, reflecting its lighter compute needs. It is also compatible with Fargate and uses awsvpc for networking.
```
{
  "family": "protected-route-frontend",
  "cpu": "256",
  "memory": "512",
  ...
}
```
### Container Settings:
The frontend serves its content on port 3001, isolating it from the backend container. The image placeholder is replaced at deployment time using the sed command in the CI/CD pipeline.
```
"containerDefinitions": [
  {
    "name": "frontend",
    "image": "IMAGE_PLACEHOLDER",
    "portMappings": [
      {
        "containerPort": 3001,
        "hostPort": 3001,
        "protocol": "tcp"
      }
    ],
    ...
  }
]
```

This dynamic templating is a vital automation technique that ensures the latest container version is deployed each time without modifying the core template.
sed "s|IMAGE_PLACEHOLDER|$FRONTEND_IMAGE|" ecs-task-def-frontend.template.json > ecs-task-def-frontend.json

### Environment and Logging:
The VITE_API_BASE_URL variable configures the frontend to talk to the backend at a specific internal IP and port. This must be updated based on the ECS networking setup. Like the backend, logs are streamed to AWS CloudWatch for centralized monitoring.
```
"environment": [
  {
    "name": "VITE_API_BASE_URL",
    "value": "http://172.31.26.32:3000/api"
  }
],
"logConfiguration": {
  ...
}
```

# CI/CD Services and Technologies
### AWS Fargate
When choosing AWS, I had the choice between AWS Fargate and EC2. AWS Fargate and EC2 are both compute services, but they differ significantly in management and use cases. Fargate is a serverless container service that abstracts away the underlying infrastructure, allowing developers to focus purely on deploying containers. It automatically scales with workload demands and charges only for the exact resources used during task execution. In contrast, EC2 requires manual management of virtual machines, including operating system updates, scaling strategies, and instance provisioning, with billing based on instance uptime. Fargate is well-suited for microservices, event-driven applications, and short-lived jobs due to its fast startup time and minimal management overhead. EC2, however, offers full control over the environment, making it ideal for complex, long-running applications or those requiring specialized configurations. While Fargate emphasizes simplicity and speed, EC2 prioritizes flexibility and deep customization.

In this CI/CD-managed application, Fargate allows GitHub Actions to build Docker images and push them to Amazon ECR. From there, ECS using Fargate can automatically deploy the latest version with minimal latency and no manual infrastructure management. This setup leads to faster release cycles, simplified deployment workflows, and better cost management, making Fargate a natural fit.

## GitHub Actions 
Github Actions is used as a source control and automation platform. It triggers builds and deployments automatically on push, PR, or manually. It also manages workflow files such as deploy-to-ecs.yml and automates linting, testing, building, and deployment. It supports containerized builds, deployments, and complex pipeline orchestration.
In CI/CD it is used to automate the build, test, and deployment pipeline. It also defines YAML-based workflows that orchestrate how code is built into Docker images, pushed to ECR, and deployed to ECS. This platform integrates easily with other GitHub features like pull requests, secrets, and Actions Marketplace.
Alternatives to Github actions include CircleCI and Jenkins. Github wins out over these first and foremost due to its large eco-system as a staple of the programming community. Circle CI has more flexible performance tuning and custom Docker layer caching, which is better suited to larger teams. Jenkins is highly customizable and extensible with plugins, but requires significant setup and maintenance. 


### GitHub Secrets
Github secrets is used to securely store credentials. It stores AWS access keys, ECR repository URLs, or other deployment secrets which are referenced in GitHub Actions workflows. In CI/CD it is used to store environment-specific credentials and inject them into workflows using the secrets context in GitHub Actions.  This prevents hardcoding secrets in workflow files and encrypts them at rest and in transit.

The alternate choice to Github secrets would have been AWS secrets due to how prevalent AWS software is in this project. Being native to AWS means access via IAM policies and SDKs. AWS secrets are generally better for runtime secrets and not CI/CD.

### Docker
Docker is a platform for building, shipping, and running applications in isolated, reproducible containers. It packages both frontend and backend apps (with shared package.json) into reproducible images. Dockerfiles define how code is built and run within CI/CD workflows. Containerisation is used for environment consistency (dev and prod), microservice architecture and ECS/Fargate deployment.

Podman is another set of containerization tools used to build, run, and manage containers. Docker relies on a long-running daemon, while Podman is daemonless and runs each container as a child process, offering better security through rootless execution. Podman is compatible with Docker images and CLI commands, making migration straightforward. Unlike Docker, Podman doesn’t require elevated privileges, which is ideal in secure or multi-user environments. Docker, however, has broader ecosystem support and integration with CI/CD tools and cloud platforms.

### Amazon ECR (Elastic Container Registry)
Amazon ECR is AWS’s private Docker container registry, used to store and manage container images. It is great for native integration with ECS, IAM, and AWS CLI. It also provides scalable and secure image hosting while scanning images for potential vulnerabilities. Alternatives to ECR include Dockerhub which is a public version of ECR. It is simpler, but also rate limited and less secure. Another option would be Github Container Registry. It being integrated with Github makes it great for dev/testing environments but has less features, and therefore scalability than ECR. 

### Amazon ECS (Elastic Container Service)
ECS is a fully managed AWS service for running Docker containers, either on EC2 instances or AWS Fargate (serverless). CI/CD workflows update ECS services to use the latest Docker image from ECR. It manages scaling, logging, and health checks. It has deep integration with ECR, IAM, VPC, and CloudWatch. This was chosen due to it’s AWS integration. It is simplified compared to Kubernetes, which is more complex, more powerful, and better suited for larger projects. Docker swarm is another option due to it’s simplicity, but it misses the AWS nativity and has less total features than ECS. 

# Development Services and Technologies
### Node.JS
Node.js serves as the runtime environment for the backend of this project, allowing JavaScript to be executed on the server side. It provides a non-blocking, event-driven architecture, making it efficient for handling multiple concurrent requests. In this project, Node.js powers the Express server, enabling the creation of APIs for user authentication, data retrieval, and interaction with the MongoDB database.

### MongoDB
MongoDB is a NoSQL database used for storing application data in a flexible, document-oriented format. In this project, MongoDB is used to organise schemas and store user data. The database is hosted on Cloud Atlas.

### Express
Express is a web framework for Node.js that simplifies the creation of server-side applications. In this project, Express is used to set up the backend API, handle HTTP requests and define routes. It provides a clean and organized way to handle server-side logic and database interactions.

### Dotenv
Dotenv is a package that loads environment variables from a .env file into process.env. This helps manage sensitive information like database connection strings, JWT secret keys, and API URLs securely. In this project, Dotenv ensures that configuration settings remain hidden from the source code, preventing security vulnerabilities.

### Jsonwebtoken (JWT)
Jsonwebtoken (JWT) is used for authentication and secure data exchange. In this project, JWT is used to generate and verify tokens for user authentication. When a user logs in, a JWT is created and sent to the client, which then includes it in future requests to access protected routes.

### Supertest/Jest
Supertest is a library for testing HTTP endpoints, while Jest is a JavaScript testing framework. Together, they are used to write and execute automated tests for the backend API in this project. Supertest allows sending HTTP requests to test route functionality, while Jest provides a test-running environment to ensure the correctness of authentication, database interactions, and API responses. In this project these were used via the creation of mock data for the venue and user functionalities, and their testing.

### React
React is a JavaScript library for building user interfaces. It allows developers to create dynamic, interactive web applications with a component-based architecture. React uses a virtual DOM to efficiently update and render components, improving performance by minimizing direct manipulation of the actual DOM. React shone in this project for it's ability to enable hook and state management.

### Vite
Vite is a fast and modern build tool for JavaScript and TypeScript projects, specifically designed to improve the development experience for web applications. Vite has a zero-config set up for React. It became the skeleton of this app.

### Axios
Axios is a library used to make HTTP requests in Node via utilising promises. Axios simplifies handling asynchronous operations by supporting promises and async/await syntax.

### Vitest
Vitest is a testing framework for Javascript apps, specifically built for Vite. It supports features like snapshot testing, mocking, and code coverage.

### React Testing Library
React Testing Library that provides utilities for simulating real user events (such as clicks, typing, and mouse movements) in your tests. It encourages testing user interactions by triggering events that mirror how users would actually interact with your application.
