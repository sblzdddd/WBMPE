
export function AJAX(method:string, url:string, callback:(error:Error|null, response:string, url:string)=>void) {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status >= 200 && xhr.status < 300) {
                callback(null, xhr.responseText, xhr.responseURL);
            } else {
                callback(new Error('Request failed with status: ' + xhr.status), xhr.responseText, xhr.responseURL);
            }
        }
    };

    xhr.open(method, url, true);
    xhr.send();
}


export function GetRealUrl(url:string, callback:(url:string) => void) {
    AJAX('HEAD', url, function(error, response, url) {
        if (error) {
            console.error(error, response);
        } else {
            callback(url.split("?")[0]);
        }
    })
}