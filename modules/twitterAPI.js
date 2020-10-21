const axios = require('axios').default;
const uuid = require('uuid');
const crypto = require('crypto');
const qs = require('qs');
const FormData = require('form-data');
const FileAPI = require('./fileAPI');
const GenerateSCP = require('./generateSCP');

async function postTweet(SCP) {
    try {
        const SCPText = GenerateSCP.getTweetTextFromSCP(SCP);
        const data = qs.stringify({
            'status': SCPText,
            'media_ids': SCP.imgURL
        });
        const axiosConfig = {
            method: 'post',
            url: 'https://api.twitter.com/1.1/statuses/update.json',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data : data
        };
        const finalAxiosConfig = buildAuthorizationOAuthFromAxiosObjectToAxiosObject(axiosConfig, true);
        
        await axios(finalAxiosConfig)
        
    } catch (e) {
        console.error(e.response.status)
        console.error(e.response.statusText)
        console.error(e.request.path)
        console.error(e.response.data)
    }
}

async function postImage(imageBinPath) {
    try {
        const imageBinStream = FileAPI.createReadStreamFromFile(imageBinPath);
        const data = new FormData();
        data.append('media', imageBinStream);

        const axiosConfig = {
            method: "POST",
            url: "https://upload.twitter.com/1.1/media/upload.json",
            headers: {
                ...data.getHeaders()
            },
            params: {
                media_category: "tweet_image",
            },
            data
        }
        const finalAxiosConfig = buildAuthorizationOAuthFromAxiosObjectToAxiosObject(axiosConfig);
        
        const response = await axios(finalAxiosConfig);

        return response.data.media_id_string
    } catch (e) {
        console.error(e)
    }

}

function customEncodeMethod(customString) {
    return qs.stringify({value: customString}).split("=")[1]
}

function buildAuthorizationOAuthFromAxiosObjectToAxiosObject(axiosObject, parseData = false) {
    const method = axiosObject.method.toUpperCase();
    const baseURL = axiosObject.baseURL || axiosObject.url;
    const OAuthParams = getOAuthParams();
    const queryParams = {
        ...axiosObject.params,
        ...OAuthParams
    }
    if (parseData) Object.assign(queryParams, qs.parse(axiosObject.data));

    const encodedBaseURL = customEncodeMethod(baseURL);
    const encodedQueryParams = customEncodeMethod(encodeQueryParamsForOAuth(queryParams));
    
    const signatureBaseString = `${method}&${encodedBaseURL}&${encodedQueryParams}`
    const signingKey = `${process.env.TWITTER_API_KEY_SECRET}&${process.env.TWITTER_API_ACCESS_TOKEN_SECRET}`;

    const signature = crypto
        .createHmac("sha1", signingKey)
        .update(signatureBaseString)
        .digest()
        .toString('base64')
    
    const encodedSignature = customEncodeMethod(signature);

    const headerAuthorization = `OAuth oauth_consumer_key="${process.env.TWITTER_API_KEY}",oauth_token="${process.env.TWITTER_API_ACCESS_TOKEN}",oauth_signature_method="${OAuthParams.oauth_signature_method}",oauth_timestamp="${OAuthParams.oauth_timestamp}",oauth_nonce="${OAuthParams.oauth_nonce}",oauth_version="${OAuthParams.oauth_version}",oauth_signature="${encodedSignature}"`;
    axiosObject.headers = {
        ...axiosObject.headers,
        'Authorization': headerAuthorization
    }
    return axiosObject;
}

function getOAuthParams() {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = uuid.v1();
    return {
        oauth_consumer_key: process.env.TWITTER_API_KEY,
        oauth_token: process.env.TWITTER_API_ACCESS_TOKEN,
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: timestamp,
        oauth_nonce: nonce,
        oauth_version: "1.0"
    }
}

function encodeQueryParamsForOAuth(queryParams) {
    let ordered = {};
    Object.keys(queryParams).sort().forEach((key) => {
        ordered[key] = queryParams[key];
    });

    let encodedQueryParams = '';
    for (k in ordered) {
        const encodedValue = customEncodeMethod(ordered[k]);
        const encodedKey = customEncodeMethod(k)
        if (encodedQueryParams === '') {
            encodedQueryParams += `${encodedKey}=${encodedValue}`
        } else {
            encodedQueryParams += `&${encodedKey}=${encodedValue}`;
        }
    }

    return encodedQueryParams;
}

module.exports = {
    postTweet,
    postImage
}