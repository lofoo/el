 DS.ElasticSearchAdapter = DS.Adapter.extend({
   url: "http://localhost:9200",


   http: {
     get: function(url, callback) {
       return jQuery.ajax({
         url: url,
         type: 'GET',
         dataType: 'json',
         cache: true,

         success: callback
       });
     },
     post: function(url, payload, callback) {
       return jQuery.ajax({
         url: url,
         type: 'POST',
         data: JSON.stringify(payload),
         dataType: 'json',
         cache: true,

         success: callback
       });
     },
     put: function(url, payload, callback) {
       return jQuery.ajax({
         url: url,
         type: 'PUT',
         data: JSON.stringify(payload),
         dataType: 'json',
         cache: true,

         success: callback
       });
     },
     delete: function(url, payload, callback) {
       return jQuery.ajax({
         url: url,
         type: 'DELETE',
         data: JSON.stringify(payload),
         dataType: 'json',
         cache: true,

         success: callback
       });
     }
   },

   find: function(store, type, id) {
     console.debug('find', store, type, id);
     var url = [this.url, type.url, id].join('/');
     console.log(url);

     var self = this;
     return this.http.get(url).then(function(data, textStatus, xhr) {
       data._source.id = data._id;
       return data._source;
     });
   },

   findAll: function(store, type) {
     var url = [this.url, type.url, '_search'].join('/');

     var self = this;
     return this.http.post(url).then(function(data, textStatus, xhr) {
       var payload = data.hits.hits;
       payload = payload.map(function(item, index) {
         item._source.id = item._id;
         return item._source;
       });
       return payload;
     });
   },

   findQuery: function(store, type, query, recordArray) {
     if (query.ids) {
       console.debug('findQuery [ids]', query);
       var url = [this.url, type.url, '_mget'].join('/');
       var payload = {
         ids: query.ids
       };

       var self = this;
       var result = [];
       return this.http.post(url, payload).then(function(data, textStatus, xhr) {
         data[Ember.keys(data)].map(function(item, index) {
           if (item.found) {
             item._source.id = item._id;
             result.push(item._source);
           }
         });
         return result;
       });
     } else if (query.docs) {
       console.debug('findQuery _mget', query);
       var url = [this.url, '_mget'].join('/');
       var payload = query;

       var self = this;
       var result = [];
       console.log(url);
       console.log(payload);
       return this.http.post(url, payload).then(function(data, textStatus, xhr) {
         data.docs.map(function(item, index) {
           if (item.found) {
             item._source.id = makeid();
             result.push(item._source);
           }
         });
         return result;
       });
     } else {
       console.debug('findQuery', query);
       var url = [this.url, type.url, '_search'].join('/');
       var payload = query;

       var self = this;
       return this.http.post(url, payload).then(function(data, textStatus, xhr) {
         var payload = data.hits.hits;
         payload = payload.map(function(item, index) {
           item._source.id = item._id;
           return item._source;
         });
         return payload;
       });
     }
   },

   createRecord: function(store, type, record) {
     console.debug('createRecord', type, record.toJSON(), 'id: ', record.get("id"));
     var id = record.get("id") || null;
     var url = [this.url, type.url, id].join('/');

     var payload = record.toJSON();
     var self = this;
     console.log(url, payload);
     return this.http.post(url, payload).then(function(data, textStatus, xhr) {
       return record.set('id', data._id);
     });
   },

   updateRecord: function(store, type, record) {
     console.debug('updateRecord', type, record.toJSON(), 'id: ', record.get("id"));
     var id = record.get("id");
     var url = [this.url, type.url, id].join('/');

     var payload = record.toJSON();
     var self = this;
     console.log(url, payload);
     return this.http.put(url, payload).then(function(data, textStatus, xhr) {
       return;
     });
   },

   deleteRecord: function(store, type, record) {
     console.debug('deleteRecord', type, record.toJSON(), 'id: ', record.get("id"));
     var id = record.get("id");
     var url = [this.url, type.url, id].join('/');

     var self = this;
     console.log(url);
     return this.http.delete(url).then(function(data, textStatus, xhr) {
       return;
     });
   }

 });