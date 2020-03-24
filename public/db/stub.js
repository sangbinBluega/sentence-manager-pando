window.mqfMapData = window.mqfMapData || {_cfg:{}}

mqfMapData.set = function(/*String*/group, /*String*/key, value)
{
    this._cfg[group] = this._cfg[group] || {};
    this._cfg[group][key] = value;
}

mqfMapData.get = function(/*String*/group, /*String*/key)/*Value|undefined*/
{
    if (this._cfg[group]) return this._cfg[group][key];
}

mqfMapData.init = function(onSucc, onErr)
{
    var _this = this;

    this._cfg.storage.sentence.call(this, /*all*/undefined, function(data){
        _this.sentence = data;

        if (onSucc) onSucc();
    }
    ,function(err){
        if (onErr) onErr(1, Err);
    });
}

mqfMapData.set('storage', 'sentence', eccSentenceLoad);
mqfMapData.set('resolver', 'sentence', eccSentenceResolve);
