const { Buffer } = require('buffer');
const https = require('https');
const { URLSearchParams } = require('url');

const isValidUrl = (value) => {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
};

const postFormUrlEncoded = (url, body, headers = {}) =>
    new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const data = body.toString();

        const requestOptions = {
            method: 'POST',
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname + parsedUrl.search,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(data),
                ...headers,
            },
        };

        const req = https.request(requestOptions, (res) => {
            let responseBody = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                responseBody += chunk;
            });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        return resolve(JSON.parse(responseBody));
                    } catch (error) {
                        return reject(new Error(`Invalid JSON response from upload: ${error.message}`));
                    }
                }
                return reject(new Error(`Upload failed: ${res.statusCode} ${responseBody}`));
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });

exports.uploadAvatar = async ({ avatarUrl, avatarBase64, filename = 'barber-avatar' }) => {
    if (avatarUrl && isValidUrl(avatarUrl)) {
        return avatarUrl;
    }

    if (!avatarBase64) {
        return null;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'barbers';

    if (!cloudName || (!apiKey && !uploadPreset)) {
        throw new Error(
            'Cloudinary configuration missing. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET or CLOUDINARY_UPLOAD_PRESET.'
        );
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const params = new URLSearchParams();
    params.append('file', `data:image/jpeg;base64,${avatarBase64}`);
    params.append('folder', folder);
    params.append('public_id', `${filename}-${Date.now()}`);

    if (uploadPreset) {
        params.append('upload_preset', uploadPreset);
    }

    const headers = {};
    if (apiKey && apiSecret) {
        const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
        headers.Authorization = `Basic ${auth}`;
    }

    const result = await postFormUrlEncoded(url, params, headers);
    return result.secure_url || result.url;
};
