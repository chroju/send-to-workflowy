const { capture } = require('../../core/capture');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    console.log('405: Method is not POST')
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { text = '', note = '', priority = 0, ...rest } = JSON.parse(
    event.body
  );

  let { parentId, sessionId } = rest;

  if (!parentId || parentId.length === 0) {
    parentId = process.env.PARENTID;
  }

  if (!sessionId || sessionId.length === 0) {
    sessionId = process.env.SESSIONID;
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTION',
  };

  const auth_token = event.headers.Authorization;
  if (auth_token === undefined) {
    console.log('400: Authorization header is not found')
    headers['WWW-Authenticate'] = 'Bearer realm=""';
    return {
      headers,
      statusCode: 400,
    }
  }

  if (auth_token.indexOf(process.env.AUTH_TOKEN) == -1) {
    console.log('401: Invalid token')
    headers['WWW-Authenticate'] = 'Bearer error="invalid_token"';
    return {
      headers,
      statusCode: 401,
    }
  }

  try {
    await capture({ parentId, sessionId, text, note, priority });
    console.log('200: OK')
    return {
      headers,
      statusCode: 200,
      body: 'Sent!',
    };
  } catch (err) {
    console.log('500: Error from Workflowy')
    return {
      headers,
      statusCode: 500,
      body: `Error ${err.status}:${err.message}`,
    };
  }
};
