var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var chromium = require('playwright').chromium;
var sendgrid = require('@sendgrid/mail');
var streamToArray = require('stream-to-array');
var raizStatementsUrl = 'https://app.raizinvest.com.au/statements';
var raizUser = process.env.RAIZSIGHT_RAIZ_USER;
var raizPassword = process.env.RAIZSIGHT_RAIZ_USER;
var emailUser = process.env.RAIZSIGHT_RAIZ_USER;
var sharesightEmail = process.env.RAIZSIGHT_RAIZ_USER;
(function () { return __awaiter(_this, void 0, void 0, function () {
    var browser, page, download, stream;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, chromium.launch()];
            case 1:
                browser = _a.sent();
                return [4 /*yield*/, browser.newPage({ acceptDownloads: true })];
            case 2:
                page = _a.sent();
                // will redirect to login
                return [4 /*yield*/, page.goto(raizStatementsUrl)];
            case 3:
                // will redirect to login
                _a.sent();
                return [4 /*yield*/, page.fill('input[name="email"]', raizUser)];
            case 4:
                _a.sent();
                return [4 /*yield*/, page.fill('input[name="password"]', raizPassword)];
            case 5:
                _a.sent();
                return [4 /*yield*/, page.click('button[type="submit"]')];
            case 6:
                _a.sent();
                // on successful login, redirected back to /statements
                // switch to Confirmation tab
                return [4 /*yield*/, page.click('button:has-text("Confirmation")')];
            case 7:
                // on successful login, redirected back to /statements
                // switch to Confirmation tab
                _a.sent();
                return [4 /*yield*/, Promise.all([
                        page.waitForEvent('download'),
                        page.click(':nth-match(button.statements-item__button:has-text("Download"), 1)') // first download
                    ])];
            case 8:
                download = (_a.sent())[0];
                return [4 /*yield*/, download.createReadStream()];
            case 9:
                stream = _a.sent();
                streamToArray(stream, function (err, arr) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
                    var content = Buffer.concat(arr).toString('base64');
                    var mail = {
                        from: emailUser,
                        to: sharesightEmail,
                        subject: 'Raiz Trade Confirmation',
                        text: 'Raiz trade confirmation is attached.',
                        attachments: [
                            {
                                filename: 'raiz-confirmation.pdf',
                                contentType: 'application/pdf',
                                content: content
                            }
                        ]
                    };
                    sendgrid.send(mail, false, function (err, info) {
                        if (err) {
                            console.error(err);
                            process.exit(1);
                        }
                        else {
                            console.log('SUCCESS');
                            console.log(info);
                            process.exit(0);
                        }
                    });
                });
                return [2 /*return*/];
        }
    });
}); })();
