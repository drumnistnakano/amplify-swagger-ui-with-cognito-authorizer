import React, {Component} from 'react';
import SwaggerUi, {presets} from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';
import './App.css';
import Amplify, {Auth} from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react'
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

class App extends Component {
  componentDidMount() {
    Auth.currentSession()
      .then(data => {
        const idToken = data.getIdToken().getJwtToken();
        SwaggerUi({
          dom_id: '#swaggerContainer',
          // Swagger を保存した S3 バケットと Swagger ファイル名を指定
          // Amplify Console の環境変数を利用してビルドの際に .env に出力
          url: `https://${process.env.REACT_APP_SWAGGER_BUCKET_NAME}.s3-ap-northeast-1.amazonaws.com/${process.env.REACT_APP_SWAGGER_FILE_NAME}`,
          presets: [presets.apis],
          requestInterceptor: (req) =>{
            console.log(req);
            if (req.url.indexOf('s3-ap-northeast-1.amazonaws.com') !== -1){
              return req;
            }
            req.headers.Authorization = idToken; 
            return req;
          }
        });
    });
  }

  render() {
    return (
      <div className="App">
      <div id="swaggerContainer" /></div>
    );
  }
}

export default withAuthenticator(App);
