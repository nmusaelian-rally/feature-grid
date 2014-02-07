Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        console.log("PI GRID");
        Ext.create('Rally.data.WsapiDataStore', {
            model: 'PortfolioItem/Feature',
            fetch: ['FormattedID','Name','Description','UserStories','Release','Project', 'PiCustomField'],
            pageSize: 100,
            autoLoad: true,
            listeners: {
                load: this._onDataLoaded,
                scope: this
            }
        });
    },
    
    _createGrid: function(features) {
         this.add({
            xtype: 'rallygrid',
            store: Ext.create('Rally.data.custom.Store', {
                data: features,
                pageSize: 100
            }),
            
            columnCfgs: [
                {
                   text: 'Formatted ID', dataIndex: 'FormattedID', xtype: 'templatecolumn',
                    tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
                },
                {
                    text: 'Name', dataIndex: 'Name'
                },
                {
                    text: 'Description', dataIndex: 'Description'
                },
                {
                    text: 'PiCustomField', dataIndex: 'PiCustomField'
                },
                {
                    text: 'Release', dataIndex: 'Release'
                },
                {
                    text: 'Project', dataIndex: 'Project'
                },
                {
                    text: 'Story Count', dataIndex: 'StoryCount'
                },
                {
                    text: 'User Stories', dataIndex: 'UserStories', 
                    renderer: function(value) {
                        var html = [];
                        Ext.Array.each(value, function(userstory){
                            html.push('<a href="' + Rally.nav.Manager.getDetailUrl(userstory) + '">' + userstory.FormattedID + '</a>')
                        });
                        return html.join(', ');
                    }
                }
            ]
            
        });
    },
    _onDataLoaded: function(store, data){
                var features = [];
                var pendingstories = data.length;
                //debugger;
                Ext.Array.each(data, function(feature) {
                            var release = feature.get('Release');
                            var f  = {
                                FormattedID: feature.get('FormattedID'),
                                Name: feature.get('Name'),
                                Description: feature.get('Description'),
                                PiCustomField: feature.get('PiCustomField'),
                                Release: (release && release.Name) || 'None',
                                Project: feature.get('Project')._refObjectName,
                                _ref: feature.get("_ref"),
                                StoryCount: feature.get('UserStories').Count,
                                UserStories: []
                            };
                            
                            var stories = feature.getCollection('UserStories');
                           stories.load({
                                fetch: ['FormattedID'],
                                callback: function(records, operation, success){
                                    Ext.Array.each(records, function(story){
                                        var number = story.get('DirectChildrenCount');  
                                        if (number == 0) {
                                            f.UserStories.push({_ref: story.get('_ref'),
                                                        FormattedID: story.get('FormattedID')
                                                    });}
                                    }, this);
                                    
                                    --pendingstories;
                                    if (pendingstories === 0) {
                                        this._createGrid(features);
                                    }
                                },
                                scope: this
                            });
                            features.push(f);
                }, this);
    }             
});
