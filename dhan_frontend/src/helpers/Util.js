import axios from 'axios';

const Util = {
    call_get_with_uri_param: async (uri_with_param, callback, type) => {
        let URL;
        URL = process.env.REACT_APP_BASE_URL
        const apiKey = process.env.REACT_APP_API_KEY;
        let url = URL + uri_with_param;
        if (url.includes("?")) {
            url = `${url}&apikey=${apiKey}`;
        } else {
            url = `${url}?apikey=${apiKey}`;
        }
        let resType;
        if (type === 'arraybuffer' || type === 'blob' || type === 'document' || type === 'json' || type === 'text' || type === 'stream') {
            resType = type;
        }
        callApi_get(url, resType)
            .then((res) => {
                if (callback) {
                    // console.log('get response ======> ', JSON.stringify(res.data));
                    const status = true;
                    callback(res.data, status);
                }
            })
            .catch(function (error) {
                if (error.response !== undefined) {
                    console.log("get error =====> ", error.response);
                    if (axios.isCancel(error)) {
                        console.log("Request canceled", error.message);
                    } else if (error.response.status === "401" || error.response.statusText === "Unauthorized") {
                        console.log("Unauthorized");
                    } else {
                        const status = false;
                        callback(error.response.data, status);
                    }
                }
            });
    },
};

export const callApi_get = async (url, resType) => {
    return await axios.get(url, {
        ...(resType ? { responseType: resType } : {}),
        headers: {
            "Content-Type": "application/json",
        },
    });
};

export default Util;
