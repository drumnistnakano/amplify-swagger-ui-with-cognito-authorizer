# amplify-swagger-ui-with-cognito-authorizer

Amplify Console 上で Swagger UI をホスティング  
Cognito Authorizer で実装された API Gateway の Swagger ファイルを画面表示  
Swagger UI で API Gateway の検証が可能  

# Usage

1. 本リポジトリをフォークして、自身の Amplify Console と連携して利用ください

```
$ npm install

$ amplify init
? Initialize the project with the above configuration? No
? Enter a name for the environment prod
? Choose your default editor: Visual Studio Code
? Choose the type of app that you're building javascript
Please tell us about your project
? What javascript framework are you using react
? Source Directory Path:  src
? Distribution Directory Path: build
? Build Command:  npm run-script build
? Start Command: npm run-script start
Using default provider  awscloudformation
? Select the authentication method you want to use: AWS profile

For more information on AWS Profiles, see:
https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html

? Please choose the profile you want to use drumnistnakano
```

2. 事前に作成していた既存の Cognito をインポートします

```
$ amplify import auth
Using service: Cognito, provided by: awscloudformation
✔ What type of auth resource do you want to import? · Cognito User Pool only
✔ Select the User Pool you want to import: · ap-northeast-1_xxxxxxx
✔ Only one Web app client found: 'todo-service-user-pool-client-prod' was automatically selected.
✔ Only one Native app client found: 'todo-service-user-pool-client-prod' was automatically selected.
⚠️ It is recommended to use different app client for web and native application.
```

3. Amplify のバックエンドにプッシュ

```
$ amplify push
✔ Successfully pulled backend environment prod from the cloud.

    Current Environment: prod
    
┌──────────┬──────────────────────────────┬───────────┬───────────────────┐
│ Category │ Resource name                │ Operation │ Provider plugin   │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Auth     │ prodamplifyswaggeruibxxxxxxx │ Import    │ awscloudformation │
└──────────┴──────────────────────────────┴───────────┴───────────────────┘
? Are you sure you want to continue? Yes
✔ All resources are updated in the cloud
```

4. Github へソースコードをコミット

```
$ git add -A
$ git commit -m "first commit"
$ git push -u origin main
```

5. Amplify Console にホスティング

Continuous deployment (Git-based deployments) でホスティングを設定します。

```
$ amplify add hosting
? Select the plugin module to execute Hosting with Amplify Console (Managed hosting with custom domains, Continuous deployment)
? Choose a type Continuous deployment (Git-based deployments)
? Continuous deployment is configured in the Amplify Console. Please hit enter once you connect your repository 
```

コマンド実行後、マネージメントコンソールに遷移されるので各種設定をします。

5. 環境変数を設定

- 追加する環境変数

以下の環境変数を追加
なお、環境変数のAMPLIFY_NATIVECLIENT_ID, AMPLIFY_USERPOOL_ID, AMPLIFY_WEBCLIENT_IDは, github issue [#9023](https://github.com/aws-amplify/amplify-cli/issues/9023)はエラーの回避策として追加する必要あり

```
REACT_APP_SWAGGER_BUCKET_NAME: {Swaggerファイル を保管している S3 バケット}
REACT_APP_SWAGGER_FILE_NAME: {Swaggerファイル名}
AMPLIFY_NATIVECLIENT_ID: {importしたamplify nativeclientid}
AMPLIFY_USERPOOL_ID: {importしたamplify userpooolid}
AMPLIFY_WEBCLIENT_ID: {importしたamplify webclientid}
```

- ビルドファイル(amplify.yml)

ビルドファイルを以下の様に設定

```
version: 1
backend:
  phases:
    build:
      commands:
        - '# Execute Amplify CLI with the helper script'
        - amplifyPush --simple
frontend:
  phases:
    preBuild:
      commands:
        - yarn install
    build:
      commands:
        - yarn run build
        - echo "REACT_APP_SWAGGER_BUCKET_NAME=$REACT_APP_SWAGGER_BUCKET_NAME" >> .env
        - echo "REACT_APP_SWAGGER_FILE_NAME=$REACT_APP_SWAGGER_FILE_NAME" >> .env
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```


1. ビルドエラー回避

エラーが発生した場合は、amplify ディレクトリの amplify/backend/auth/torcidentityfd5750d1/build/parameters.jso をひとつ上の階層に移動して、build ディレクトリを削除することで回避可能

[isuue 9023](https://github.com/aws-amplify/amplify-cli/issues/9023#issuecomment-975940277) より

>　@cwdcwd Got a chance to review your files and for some reason (not able to repro it) for the imported auth resource - the parameters.json file for the auth resource (amplify/backend/auth/torcidentityfd5750d1) seems to be inside the amplify/backend/auth/torcidentityfd5750d1/build/ directory. If you move this parameters.json file one level up and remove the build/ directory - like the auth resource I've shown up in my comment, then you should be able to continue. Please let me know if you need more clarification or information. 