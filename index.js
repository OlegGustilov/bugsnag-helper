import uuid4 from 'uuid4';
import _ from "lodash";

class BugsnagHelper {
    /**
     *
     * @param {object} bugsnagClient - initialized bugsnag client
     * @param {object} options - {hideIp:true - will hide user ip in notifications}
     */
    constructor(bugsnagClient, options) {
        this._bugsnag = bugsnagClient;
        this._options = options;

        this._user = null;
        this._httpRequest = null;
        this._httpResponse = null;
    }

    /**
     * Add metadata about current user when error happened
     * @param {object} user - {firstName, lastName, name, email}
     * @returns {BugsnagHelper}
     */
    setUser(user) {
        if(!user) {
            return this;
        }

        this._user = {
            name: this._getUserName(user) || 'n/a',
            email: user.email || 'n/a',
            id: uuid4()
        };
        return this;
    }

    /**
     * Add metadata about http request
     * @param {object} requestInfo -  {url, baseURL}
     */
    setHttpRequestInfo(requestInfo) {
        requestInfo = {
            url: requestInfo.url || 'n/a',
            website: requestInfo.baseURL || 'n/a'
        };
        this._httpRequest = requestInfo;
        return this;
    }

    /**
     * Add metadata about http response body
     * @param {object} responseBody - response body
     */
    setHttpResponseInfo(responseBody) {
        this._httpResponse = responseBody;
        return this;
    }

    /**
     * Send error to bugsnag
     * @param {Error} error
     */
    notify(error) {
        this._bugsnag.notify(error, this._onErrorCallback.bind(this));
    }

    /**
     * Error callback will be called before send error notification
     * @param {object} event - bugsnag internal data about error
     * @private
     */
    _onErrorCallback(event) {
        if(this._options.hideIp) {
            event.request.clientIp = '';
        }

        if(this._user) {
            event._user = _.merge({}, event._user, this._user);
        }

        if(this._httpRequest) {
            event.addMetadata('SERVER REQUEST', this._httpRequest);
        }

        if(this._httpResponse) {
            event.addMetadata('SERVER RESPONSE', this._httpResponse);
        }
    }

    _getUserName(user) {
        if(!user) {
            return null;
        }

        if(!user.firstName || !user.name) {
            return null;
        }

        return (user.firstName) ? `${user.firstName} ${user.lastName}` : user.name;
    }
}

export default BugsnagHelper;