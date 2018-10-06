var Datastore;
var db = {};
module.exports = {
    init: function ()
    {
        Datastore = require("nedb");
        db.entries = new Datastore({ filename: './data/entries.db', autoload: true });
        db.storage = new Datastore({ filename: './data/storage.db', autoload: true });
        return db;
    },
    getStorageItem: function (callBack)
    {
        db.storage.find({}, function (err, docs)
        {
            callBack(docs);
        });
    },
    upsertItem: function (data)
    {
        if (data._id)
        {
            db.storage.update({ _id: data._id }, data, {}, function (err, doc)
            {
                console.log(err || doc);
            });
        }
        db.storage.insert(data);
    },
    useItem: function (data)
    {
        console.log(data);
    },
    getDefaultItems: function (callBack)
    {
        db.storage.find({ defualtItem: true }, function (err, docs)
        {
            const value = err ? [] : docs;
            callBack(value);
        });
    },
    saveItem: function (data)
    {
        db.entries.insert(data);
    },
    getAllEntries: function (callBack)
    {
        db.entries.find({}, function (err, docs)
        {
            const value = err ? [] : docs;
            callBack(value);
        });
    },
    getChemicalItems: function (term, callBack)
    {
        db.storage.find({
            $where: function ()
            {
                return this.name
                    .toLowerCase()
                    .includes(term.toLowerCase())
                    && this.type === 'Color';
            }
        }, function (err, docs)
            {
                const value = err ? [] : docs;
                callBack(value);
            });
    },
    removeItems: function (data)
    {
        data.forEach(v =>
        {
            db.storage.update({ name: v.name }, { $inc: { looseAmount: -v.quantity } }, function (err, doc)
            {
                console.log(err || doc);
            })
        });
    },
    findStorageItem: function (term, callBack)
    {
        db.storage.find({
            $where: function ()
            {
                return this.name
                    .toLowerCase()
                    .includes(term.toLowerCase())
            }
        }, function (err, docs)
            {
                const value = err ? [] : docs;
                callBack(value);
            });
    },
    deleteStorageItem: function (id, callBack)
    {
        db.storage.remove({ _id: id }, function (err, numRemoved)
        {
            callBack(err ? false : true);
        });
    },
    deleteEntry: function (id, callBack)
    {
        db.entries.remove({ _id: id }, function (err, numRemoved)
        {
            callBack(err ? false : true);
        });
    }
}