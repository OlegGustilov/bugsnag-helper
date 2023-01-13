import uuid4 from 'uuid4';
import _ from "lodash";
import Bugsnag from "@bugsnag/js";


class BugsnagHelper {
    /**
     *
     * @param {string} apiKey
     * @param {object} options
     */
    constructor(apiKey, options) {
        this._apiKey = apiKey;
        this._options = options;

        this._user = null;
        this._httpRequest = null;
        this._httpResponse = null;
    }

    /**
     * Start bugsnag client using plugins and options
     * @param {[object]} plugins
     */
    start(plugins = []) {
        const options = _.merge({},
            {
                apiKey: this._apiKey,
                plugins: plugins
            }, this._options);
        Bugsnag.start(options);
    }

    getClient() {
        return Bugsnag;
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
        Bugsnag.notify(error, this._onErrorCallback.bind(this));
    }

    /**
     * Error callback will be called before send error notification
     * @param {object} event - bugsnag internal data about error
     * @private
     */
    _onErrorCallback(event) {
        if(!this._options.collectUserIp) {
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