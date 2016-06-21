//view_list_inherit = function(instance) {
//    var _t = instance.web._t,
//    _lt = instance.web._lt;
//    var QWeb = instance.web.qweb;
//
//    instance.web.View.include({
//        load_view: function(context) {
//            var self = this;
//            var view_loaded_def;
//            this.get_data_field_show();
//            if (this.embedded_view) {
//                view_loaded_def = $.Deferred();
//                $.async_when().done(function() {
//                    view_loaded_def.resolve(self.embedded_view);
//                });
//            }else {
//                if (! this.view_type){
//                    console.warn("view_type is not defined", this);
//                    }
//                view_loaded_def = instance.web.fields_view_get({
//                    "model": this.dataset._model,
//                    "view_id": this.view_id,
//                    "view_type": this.view_type,
//                    "toolbar": !!this.options.$sidebar,
//                    "context": this.dataset.get_context(),
//                });
//            }
//            return this.alive(view_loaded_def).then(function(r) {
//                self.fields_view = r;
//                // add css classes that reflect the (absence of) access rights
//                self.$el.addClass('oe_view')
//                    .toggleClass('oe_cannot_create', !self.is_action_enabled('create'))
//                    .toggleClass('oe_cannot_edit', !self.is_action_enabled('edit'))
//                    .toggleClass('oe_cannot_delete', !self.is_action_enabled('delete'));
//                return $.when(self.view_loading(r)).then(function() {
//                    self.render_fields_show();
//                    self.trigger('view_loaded', r);
//                });
//            });
//        },
//        get_data_field_show: function () {
//            var self = this;
//            new instance.web.Model('show.fields').get_func('action')({'model_name': self.model, 'user_id': self.session.uid}, 'select').then(function (result){
//                self.data_show_field = result.data;
//                self.all_fields_of_model = result.fields;
//            });
//        },
//        render_fields_show: function () {
//            var self = this;
//            if (typeof(self.model) != 'undefined'){
//                if ($('.choose_field_show').length <= 0 && !$('.oe_searchview').is(':hidden')) {
//                    var show_field_model = new instance.web.Model('show.fields');
//                    QWeb.add_template("/show_sequence_columns_easy/static/src/xml/my_control.xml");
//                    $('.oe_view_manager_header col[width="30%"]').css({'width': '38%'});
//                    var data_show_field = self.data_show_field;
//                    var all_fields_of_model = self.all_fields_of_model;
//                    var field_visible = data_show_field.hasOwnProperty('fields_show') && data_show_field['fields_show'] ? eval(data_show_field['fields_show']) : _.pluck(self.visible_columns, 'name');
//                    var fields_sequence = data_show_field.hasOwnProperty('fields_sequence') && data_show_field['fields_sequence'] ? JSON.parse(data_show_field['fields_sequence']) : {}
//                    var list_data = [];
//                    for (var field_name in all_fields_of_model){
//                        var field_obj = all_fields_of_model[field_name];
//                        var data = {value: field_name, string: field_obj.string}
//                        if (field_visible.indexOf(field_name) >= 0){
//                            data['checked'] = 'checked';
//                            if (fields_sequence.hasOwnProperty(field_name)){
//                                data['sequence'] = fields_sequence[field_name];
//                            }
//                        }
//                        list_data.push(data);
//                    }
//                    list_data = _.sortBy(list_data, function (o){return o.sequence});
//
//                    if (typeof(QWeb.templates['ShowField']) != 'undefined'){
//                        var tem = QWeb.render('ShowField',
//                        {data: {suggestion: list_data,
//                         attrs: {color: data_show_field.color || 'check-primary'}}});
//                        // set style
//                        $('.oe_view_manager_switch').css({'float': 'right'});
//                        $('.oe_view_manager_pager').css({'float': 'left'}).after(tem);
//                        // events
//                        $(".toggle_select_field").click(function() {
//                            $(".text_suggestion").toggle();
//                        });
//                        $(".sequence").change(function () {
//                            $(this).parent().prevAll('input').attr({'sequence': $(this).val()});
//                        });
//                        $("i[setting]").click(function () {
//                            alert($(this).attr('setting'));
//                        });
//                        self.setting_fields_show();
//                        self.update_show_fields();
//                    }
//                }else if($('.oe_searchview').is(':hidden')){
//                    $('.choose_field_show').remove();
//                }
//            }
//        },
//        update_show_fields: function () {
//            var self = this;
//            $('a[action="update"]').click(function () {
//                var fields = []
//                var sequence = {}
//                $('.suggestion input:checked').each(function () {
//                    fields.push($(this).val());
//                    _seq = $(this).attr('sequence') || false;
//                    if (_seq){
//                        sequence[$(this).attr('id')] = parseInt(_seq);
//                    }
//                });
//                new instance.web.Model('show.fields').get_func('action')({'model_name': self.model, 'fields_show': fields,
//                'user_id': self.session.uid, 'fields_sequence': JSON.stringify(sequence)}, 'update').then(function (result) {
//                    location.reload();
//                });
//            });
//        },
//        setting_fields_show: function () {
//            var self = this;
//            $(".fields_setting").click(function () {
//                var $form_show = $(QWeb.render('FormShowField', self.data_show_field));
////  set data for form
//                $form_show.find('input[name="color"][value="'+(self.data_show_field.color || 'check-primary')+'"]').attr('checked', true);
//                if (self.data_show_field.fix_header_list_view){
//                    $form_show.find('#fix_header_list_view').attr('checked', true);
//                }
//                if (self.data_show_field.color_for_list){
//                    $form_show.find('#color_for_list').attr('checked', true);
//                }
////                insert to body
//                $form_show.insertAfter('body');
//
////                events
//                $('.close-field-show').click(function () {
//                    $form_show.remove();
//                });
//                $form_show.find('a[action="update"]').click(function () {
//                    var data = {color: $form_show.find('input[name="color"]:checked').val(),
//                                fix_header_list_view: false, color_for_list: false, model_name: self.model,
//                                user_id: self.session.uid}
//                    if ($form_show.find('#fix_header_list_view').is(':checked')){
//                        data.fix_header_list_view = true;
//                    }
//                    if ($form_show.find('#color_for_list').is(':checked')){
//                        data.color_for_list = true;
//                    }
//                    new instance.web.Model('show.fields').get_func('action')(data, 'update').then(function (result) {
//                        location.reload();
//                    });
//                });
//            });
//        }
//    });
//
//   instance.web.ListView.include({
//        view_loading: function(r) {
//            this.prepare_field_show(r);
//            return this._super(r);
//        },
//        prepare_field_show: function (r) {
//            if (this.hasOwnProperty('data_show_field')){
//                var fields_show = eval(this.data_show_field.fields_show) || [];
//                var fields_sequence = this.data_show_field.fields_sequence || '{}';
//                fields_sequence = JSON.parse(fields_sequence)
//                var all_fields_of_model = this.all_fields_of_model;
//                var field = {}, children = [], _fields_show = [];
//                for (idx in fields_show) {
//                    var _field = fields_show[idx];
//                    _fields_show.push({'value': _field, 'sequence': fields_sequence[_field] || 100});
//                }
//                _fields_show = _.sortBy(_fields_show, function (o){return o.sequence});
//                // prepare fields
//                for (_field in _fields_show){
//                    _field = _fields_show[_field];
//                    children.push({attrs: {modifiers: "", name: _field.value}, children: [], tag: "field"});
//                    field[_field.value] = all_fields_of_model[_field.value]
//                }
//                // prepare children
//                for (_field in r.arch.children){
//                    _field = r.arch.children[_field]
//                    if (!field.hasOwnProperty(_field.attrs.name)){
//                        field[_field.attrs.name] = all_fields_of_model[_field.attrs.name]
//                        children.push(_field);
//                    }
//                }
//                r.fields = field;
//                r.arch.children = children;
////                set color for listview
//                if (this.data_show_field.color_for_list){
//                    r.arch.attrs['class'] = this.data_show_field.color;
//                }
//            }
//        }
//    });
//};
//
//openerp.show_sequence_columns_easy = function(instance) {
//    view_list_inherit(instance);
//};
//odoo.define('show_sequence_columns_easy.form_widgets', function (require) {
//    "use strict";
//
//    var core = require('web.core');
//    var data = require('web.data');
//    var data_manager = require('web.data_manager');
//    var pyeval = require('web.pyeval');
//    var Widget = require('web.Widget');
//
//    View = View.extend({
//        init: function (parent, dataset, fields_view, options) {
//            this._super(parent, dataset, fields_view, options)
//            alert('abc')
//        }
//    });
//    return View;
////    FieldChar.include({
//        // this is will be work for all FieldChar in the system
//        template: 'MyChar', // my template for char fields
//        // we can create here any logic for render
//        //render_value: function() {
//        //}
//    });
//    // this is widget for unique CharField
//    var MyModuleFieldChar = FieldChar.extend({
//        template: 'MyUniqueChar' // my custom template for unique char field
//    });
//    // register unique widget, because Odoo does not know anything about it
//    core.form_widget_registry.add('my_unique_char', MyModuleFieldChar);
//    core.form_widget_registry.add('my_unique_char', MyModuleFieldChar);
//});

odoo.define('show_sequence_columns_easy.my_listviewok', function (require) {
"use strict";

    var core = require('web.core');
    var ListView = require('web.ListView');
    var QWeb = core.qweb;

    ListView.include({
        init: function(parent, dataset, fields_view, options) {
//            alert('ecv');
            this.get_data_field_show();
            this._super(parent, dataset, fields_view, options);
            var my_ob = {}
            for(var f in this.fields_view.fields){
                if (f != 'partner_id'){
                   my_ob[f] = this.fields_view.fields[f]
                }
            }
//            _.pluck(self.visible_columns, 'name')
            var children = [];
            for(var f in this.fields_view.arch.children){
                var ob = this.fields_view.arch.children[f];
                if (ob.attrs.name != 'partner_id'){
                        children.push(ob);
                }
            }
            this.fields_view.fields = my_ob;
            this.fields_view.arch.children = children;
        },
        get_data_field_show: function () {
            var self = this;
            new instance.web.Model('show.fields').get_func('action')({'model_name': self.model, 'user_id': self.session.uid}, 'select').then(function (result){
                self.data_show_field = result.data;
                self.all_fields_of_model = result.fields;
            });
        },
        update_show_fields: function () {
            var self = this;
            $('a[action="update"]').click(function () {
                var fields = []
                var sequence = {}
                $('.suggestion input:checked').each(function () {
                    fields.push($(this).val());
                    _seq = $(this).attr('sequence') || false;
                    if (_seq){
                        sequence[$(this).attr('id')] = parseInt(_seq);
                    }
                });
                new instance.web.Model('show.fields').get_func('action')({'model_name': self.model, 'fields_show': fields,
                'user_id': self.session.uid, 'fields_sequence': JSON.stringify(sequence)}, 'update').then(function (result) {
                    location.reload();
                });
            });
        },
        setting_fields_show: function () {
            var self = this;
            $(".fields_setting").click(function () {
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
                    new instance.web.Model('show.fields').get_func('action')(data, 'update').then(function (result) {
                        location.reload();
                    });
                });
            });
        }
    });
});

odoo.define('show_sequence_columns_easy.my_listview', function (require) {
"use strict";

var core = require('web.core');
var ListView = require('web.ListView');
var QWeb = core.qweb;

    ListView.include({
         load_view: function(context) {
            alert('abc');
            this._super(context);
            }
    });
});
//            var self = this;
//            var view_loaded_def;
//            this.get_data_field_show();
//            if (this.embedded_view) {
//                view_loaded_def = $.Deferred();
//                $.async_when().done(function() {
//                    view_loaded_def.resolve(self.embedded_view);
//                });
//            }else {
//                if (! this.view_type){
//                    console.warn("view_type is not defined", this);
//                    }
//                view_loaded_def = instance.web.fields_view_get({
//                    "model": this.dataset._model,
//                    "view_id": this.view_id,
//                    "view_type": this.view_type,
//                    "toolbar": !!this.options.$sidebar,
//                    "context": this.dataset.get_context(),
//                });
//            }
//            return this.alive(view_loaded_def).then(function(r) {
//                self.fields_view = r;
//                // add css classes that reflect the (absence of) access rights
//                self.$el.addClass('oe_view')
//                    .toggleClass('oe_cannot_create', !self.is_action_enabled('create'))
//                    .toggleClass('oe_cannot_edit', !self.is_action_enabled('edit'))
//                    .toggleClass('oe_cannot_delete', !self.is_action_enabled('delete'));
//                return $.when(self.view_loading(r)).then(function() {
//                    self.render_fields_show();
//                    self.trigger('view_loaded', r);
//                });
//            });
//        },
//        get_data_field_show: function () {
//            var self = this;
//            new instance.web.Model('show.fields').get_func('action')({'model_name': self.model, 'user_id': self.session.uid}, 'select').then(function (result){
//                self.data_show_field = result.data;
//                self.all_fields_of_model = result.fields;
//            });
//        },
//        render_fields_show: function () {
//            var self = this;
//            if (typeof(self.model) != 'undefined'){
//                if ($('.choose_field_show').length <= 0 && !$('.oe_searchview').is(':hidden')) {
//                    var show_field_model = new instance.web.Model('show.fields');
//                    QWeb.add_template("/show_sequence_columns_easy/static/src/xml/my_control.xml");
//                    $('.oe_view_manager_header col[width="30%"]').css({'width': '38%'});
//                    var data_show_field = self.data_show_field;
//                    var all_fields_of_model = self.all_fields_of_model;
//                    var field_visible = data_show_field.hasOwnProperty('fields_show') && data_show_field['fields_show'] ? eval(data_show_field['fields_show']) : _.pluck(self.visible_columns, 'name');
//                    var fields_sequence = data_show_field.hasOwnProperty('fields_sequence') && data_show_field['fields_sequence'] ? JSON.parse(data_show_field['fields_sequence']) : {}
//                    var list_data = [];
//                    for (var field_name in all_fields_of_model){
//                        var field_obj = all_fields_of_model[field_name];
//                        var data = {value: field_name, string: field_obj.string}
//                        if (field_visible.indexOf(field_name) >= 0){
//                            data['checked'] = 'checked';
//                            if (fields_sequence.hasOwnProperty(field_name)){
//                                data['sequence'] = fields_sequence[field_name];
//                            }
//                        }
//                        list_data.push(data);
//                    }
//                    list_data = _.sortBy(list_data, function (o){return o.sequence});
//
//                    if (typeof(QWeb.templates['ShowField']) != 'undefined'){
//                        var tem = QWeb.render('ShowField',
//                        {data: {suggestion: list_data,
//                         attrs: {color: data_show_field.color || 'check-primary'}}});
//                        // set style
//                        $('.oe_view_manager_switch').css({'float': 'right'});
//                        $('.oe_view_manager_pager').css({'float': 'left'}).after(tem);
//                        // events
//                        $(".toggle_select_field").click(function() {
//                            $(".text_suggestion").toggle();
//                        });
//                        $(".sequence").change(function () {
//                            $(this).parent().prevAll('input').attr({'sequence': $(this).val()});
//                        });
//                        $("i[setting]").click(function () {
//                            alert($(this).attr('setting'));
//                        });
//                        self.setting_fields_show();
//                        self.update_show_fields();
//                    }
//                }else if($('.oe_searchview').is(':hidden')){
//                    $('.choose_field_show').remove();
//                }
//            }
//        },
//        update_show_fields: function () {
//            var self = this;
//            $('a[action="update"]').click(function () {
//                var fields = []
//                var sequence = {}
//                $('.suggestion input:checked').each(function () {
//                    fields.push($(this).val());
//                    _seq = $(this).attr('sequence') || false;
//                    if (_seq){
//                        sequence[$(this).attr('id')] = parseInt(_seq);
//                    }
//                });
//                new instance.web.Model('show.fields').get_func('action')({'model_name': self.model, 'fields_show': fields,
//                'user_id': self.session.uid, 'fields_sequence': JSON.stringify(sequence)}, 'update').then(function (result) {
//                    location.reload();
//                });
//            });
//        },
//        setting_fields_show: function () {
//            var self = this;
//            $(".fields_setting").click(function () {
//                var $form_show = $(QWeb.render('FormShowField', self.data_show_field));
////  set data for form
//                $form_show.find('input[name="color"][value="'+(self.data_show_field.color || 'check-primary')+'"]').attr('checked', true);
//                if (self.data_show_field.fix_header_list_view){
//                    $form_show.find('#fix_header_list_view').attr('checked', true);
//                }
//                if (self.data_show_field.color_for_list){
//                    $form_show.find('#color_for_list').attr('checked', true);
//                }
////                insert to body
//                $form_show.insertAfter('body');
//
////                events
//                $('.close-field-show').click(function () {
//                    $form_show.remove();
//                });
//                $form_show.find('a[action="update"]').click(function () {
//                    var data = {color: $form_show.find('input[name="color"]:checked').val(),
//                                fix_header_list_view: false, color_for_list: false, model_name: self.model,
//                                user_id: self.session.uid}
//                    if ($form_show.find('#fix_header_list_view').is(':checked')){
//                        data.fix_header_list_view = true;
//                    }
//                    if ($form_show.find('#color_for_list').is(':checked')){
//                        data.color_for_list = true;
//                    }
//                    new instance.web.Model('show.fields').get_func('action')(data, 'update').then(function (result) {
//                        location.reload();
//                    });
//                });
//            });
//        }
//});
//});