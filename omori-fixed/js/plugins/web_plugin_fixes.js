// Replace two plugin entries that were accidentally bundled as encrypted binary data.
window["data/js/plugins"]["WaitFPS.js"] = String.raw`//========================================
// WaitFPS.js
// by Tsukimi
// Last Updated: 2018.10.22
//========================================

(function() {
    'use strict';

    var pluginName = 'WaitFPS';
    var getParamString = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };

    var getParamNumber = function(paramNames) {
        return Number(getParamString(paramNames)) || 0;
    };

    var momentFPSThreshold = getParamNumber("momentFPSThreshold");
    var meanFPSThreshold = getParamNumber("meanFPSThreshold");
    var meanFPSFrames = getParamNumber("meanFPSFrames");
    var maxWaitTime = getParamNumber("maxWaitTime");

    var _Game_Interpreter_clear = Game_Interpreter.prototype.clear;
    Game_Interpreter.prototype.clear = function() {
        _Game_Interpreter_clear.apply(this, arguments);
        this._MFPSwait = maxWaitTime;
    };

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        if ((command || '').toUpperCase() !== "WAITFPS") return;

        this._waitCount = 1;
        this.setWaitMode("fps");
    };

    var _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        var waiting = false;
        if (this._waitMode == "fps") {
            this._MFPSwait--;
            waiting = !SceneManager.meetFPSCondition();
            if (!waiting || this._MFPSwait <= 0) {
                this._waitMode = '';
                this._MFPSwait = maxWaitTime;
            }
        } else {
            waiting = _Game_Interpreter_updateWaitMode.apply(this, arguments);
        }
        return waiting;
    };

    SceneManager._momentFPS = 0;
    SceneManager._meanFPSArr = [];

    SceneManager.meetFPSCondition = function() {
        var meanFPS = 0;
        for (var i = 0; i < this._meanFPSArr.length; i++) {
            meanFPS += this._meanFPSArr[i];
        }
        meanFPS /= this._meanFPSArr.length;
        return this._momentFPS > momentFPSThreshold && meanFPS > meanFPSThreshold;
    };

    var _SceneManager_updateMain = SceneManager.updateMain;
    SceneManager.updateMain = function() {
        var newTime = this._getTimeInMsWithoutMobileSafari();
        var fTime = (newTime - this._currentTime) / 1000;
        this._momentFPS = 1 / fTime;
        this._meanFPSArr.push(this._momentFPS);
        if (this._meanFPSArr.length > meanFPSFrames) this._meanFPSArr.shift();
        _SceneManager_updateMain.apply(this, arguments);
    };
})();
`;

window["data/js/plugins"]["DisableMouse.js"] = String.raw`//-----------------------------------------------------------------------------
// Galv's Disable Mouse
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_NoMouse = true;

TouchInput._onMouseDown = function(event) {
    // Overwrite to do nothing.
};
`;

// Remove the third-party port credit drawn over the title screen. Appending the
// override keeps the original title plugin intact while replacing only its
// credit-sprite factory after the plugin has been evaluated.
window["data/js/plugins"]["Omori Title Screen.js"] += String.raw`
Scene_OmoriTitleScreen.prototype.createVersionText = function() {};

// Some builds replace the short version label at runtime with a longer port
// credit. Suppress only those credit strings without affecting normal text.
const _omoriWebDrawText = Bitmap.prototype.drawText;
Bitmap.prototype.drawText = function(text) {
    if (/breadbb|gn-math|port\s+(?:made\s+)?by|github\.io/i.test(String(text))) return;
    return _omoriWebDrawText.apply(this, arguments);
};
`;
