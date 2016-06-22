odoo.define('show_sequence_columns_easy.my_listviewok', function (require) {
"use strict";
    var core = require('web.core');
    var ListView = require('web.ListView');
    var View = require('web.View');
    var QWeb = core.qweb;
    var Model = require('web.Model');
    var session = require('web.session');
    var ViewManager = require('web.ViewManager');
    var data_manager = require('web.data_manager');


    ViewManager.include({
        load_views: function (load_fields) {
            var self = this;
            var views = [];
                    var Model = require('web.Model');
            var Show_Field = new Model('show.fields');
            _.each(this.views, function (view) {
                if (!view.fields_view) {
                    views.push([view.view_id, view.type]);
                }
            });
            var options = {
                action_id: this.action.id,
                load_fields: load_fields,
                toolbar: this.flags.sidebar,
            };
            if (this.flags.search_view && !this.search_fields_view) {
                options.load_filters = true;
                var searchview_id = this.action.search_view_id && this.action.search_view_id[0];
                views.push([searchview_id || false, 'search']);
            }

            return Show_Field.call('action', [{'model_name': self.dataset._model.name, 'user_id': self.dataset.context.uid}, 'select']).then(function (result) {
                self.result = result;
                return data_manager.load_views(self.dataset, views, options).then(function (fields_views) {
                    _.each(fields_views, function (fields_view, view_type) {
                        fields_view.result = self.result;
                        if (view_type === 'search') {
                            self.search_fields_view = fields_view;
                        }else{
                            self.views[view_type].fields_view = fields_view;
                        }
                    });
                });
            })
        },
    })

    View.include({
        init: function (parent, dataset, fields_view, options) {
            var self = this;
            this._super(parent, dataset, fields_view, options);
            if (this.fields_view.type == 'tree'){
                var Show_Field = new Model('show.fields');
                QWeb.add_template("/show_sequence_columns_easy/static/src/xml/my_control.xml");
//                Show_Field.call('action', [{'model_name': self.model, 'user_id': session.uid}, 'select']).then(function (result) {
                    String.prototype.replaceAll = function(target, replacement) {return this.split(target).join(replacement); };
                    var data_show_field = this.fields_view.result.data || {};
                    self.data_show_field = data_show_field;
                    var all_fields_of_model = this.fields_view.result.fields || {};
                    self.all_fields_of_model = all_fields_of_model;

                    var fields = self.fields_view.fields;
                    var children = self.fields_view.arch.children;

                    var field_visible = data_show_field.hasOwnProperty('fields_show') && data_show_field['fields_show'] ? eval(data_show_field['fields_show'].replaceAll("u'", "'")) : _.pluck(self.visible_columns, 'name');
                    var fields_sequence = data_show_field.hasOwnProperty('fields_sequence') && data_show_field['fields_sequence'] ? JSON.parse(data_show_field['fields_sequence']) : {}

                    var list_data = [];
                    for (var field_name in all_fields_of_model){
                        var field_obj = all_fields_of_model[field_name];
                        var data = {value: field_name, string: field_obj.string}
                        if (field_visible.indexOf(field_name) >= 0){
                            data['checked'] = 'checked';
                            if (fields_sequence.hasOwnProperty(field_name)){
                               data['sequence'] = fields_sequence[field_name];
                            }
                        }
                        list_data.push(data);
                    }
                    list_data = _.sortBy(list_data, function (o){return o.sequence});
                    self.data = {suggestion: list_data, attrs: {color: data_show_field.color || 'check-primary'}}


                    var field = {}, children = [], _fields_show = [];
                    for (var idx in field_visible){
                        var _field = field_visible[idx];
                        _fields_show.push({'value': _field, 'sequence': fields_sequence[_field] || 100});
                    }
                    _fields_show = _.sortBy(_fields_show, function (o){return o.sequence});


                    for (var _field in _fields_show){
                        _field = _fields_show[_field];
                        children.push({attrs: {modifiers: "", name: _field.value}, children: [], tag: "field"});
                        field[_field.value] = all_fields_of_model[_field.value]
                    }

                    // prepare children
                    var _children = self.fields_view.arch.children
                    for (var _field in _children){
                        if (_children.hasOwnProperty(_field)){
                            _field = _children[_field]
                            if (_field.tag == "field" && !field.hasOwnProperty(_field.attrs.name)){
                                field[_field.attrs.name] = all_fields_of_model[_field.attrs.name]
                                children.push(_field);
                            }
                        }
                    }
                    self.fields_view.fields = field;
                    console.log('ok');
                    self.fields_view.arch.children = children;
//                });
            }
        }
    });

    ListView.include({
        render_buttons: function($node) {
            var self = this;
            if (!this.$buttons) {
                this.$buttons = $(QWeb.render("ListView.buttons", {'widget': this}));
                this.$buttons.find('.o_list_button_add').click(this.proxy('do_add_record'));
                this.$buttons.appendTo($node);
                $node.find(".toggle_select_field").click(function() {
                    $(this).next().toggle();
                });
                $node.find(".sequence").change(function () {
                    $(this).parent().prevAll('input').attr({'sequence': $(this).val()});
                });
                $node.find("i[setting]").click(function () {
                    alert($(this).attr('setting'));
                });
                this.setting_fields_show($node);
                this.update_show_fields($node);
            }
        },
        update_show_fields: function (node) {
            var self = this;
            node.find('a[action="update"]').click(function () {
                var fields = []
                var sequence = {}
                self.$buttons.find('.choose_field_show').find('.suggestion input:checked').each(function () {
                    fields.push($(this).val());
                    var _seq = $(this).attr('sequence') || false;
                    if (_seq){
                        sequence[$(this).attr('id')] = parseInt(_seq);
                    }
                });
                new Model('show.fields').call('action', [{'model_name': self.model, 'fields_show': fields,
                'user_id': self.session.uid, 'fields_sequence': JSON.stringify(sequence)}, 'update']).then(function (result) {
                    location.reload();
                });
            });
        },
        setting_fields_show: function (node) {
            var self = this;
            node.find(".fields_setting").click(function () {
                var $form_show = $(QWeb.render('FormShowField', self.data_show_field));
//  set data for form
                $form_show.find('input[name="color"][value="'+(self.data_show_field.color || 'check-primary')+'"]').attr('checked', true);
                if (self.data_show_field.fix_header_list_view){
                    $form_show.find('#fix_header_list_view').attr('checked', true);
                }
                if (self.data_show_field.color_for_list){
                    $form_show.find('#color_for_list').attr('checked', true);
                }
//                insert to body
                $form_show.insertAfter('body');

//                events
                $('.close-field-show').click(function () {
                    $form_show.remove();
                });
                $form_show.find('a[action="update"]').click(function () {
                    var data = {color: $form_show.find('input[name="color"]:checked').val(),
                                fix_header_list_view: false, color_for_list: false, model_name: self.model,
                                user_id: self.session.uid}
                    if ($form_show.find('#fix_header_list_view').is(':checked')){
                        data.fix_header_list_view = true;
                    }
                    if ($form_show.find('#color_for_list').is(':checked')){
                        data.color_for_list = true;
                    }
                    new Model('show.fields').call('action', [data, 'update']).then(function (result) {
                        location.reload();
                    });
                });
            });
        }
    });

    ListView.List.include({
        init: function(group, opts){
            this._super(group, opts);
        }
    });
});