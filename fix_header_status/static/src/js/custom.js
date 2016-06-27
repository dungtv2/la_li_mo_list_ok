custom = function(instance) {
    var _t = instance.web._t,
    _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    instance.web.FormView = instance.web.FormView.extend({
        load_form: function(data) {
            var self = this;
            this.$sidebar = this.options.$sidebar || this.$el.find('.oe_form_sidebar');
            if (!this.sidebar && this.options.$sidebar) {
                this.sidebar = new instance.web.Sidebar(this);
                this.sidebar.appendTo(this.$sidebar);
                if (this.fields_view.toolbar) {
                    this.sidebar.add_toolbar(this.fields_view.toolbar);
                }

                this.sidebar.add_items('other', _.compact([
                    self.is_action_enabled('delete') && { label: _t('Delete'), callback: self.on_button_delete }
                ]));
                // Do hide button "Duplicate" if form view has attr duplicate = false|False|0
                var duplicate = this.fields_view.arch.attrs.duplicate;
                if ([0, 'false', 'False'].indexOf(duplicate) < 0){
                    this.sidebar.add_items('other', _.compact([
                       self.is_action_enabled('create') && { label: _t('Duplicate'), callback: self.on_button_duplicate }
                    ]));
                }
            }
            //fix header position when scroll
            this._super(data);
            var container = this.$el.hasClass("oe_form_container") ? this.$el : this.$el.find('.oe_form_container');
            var header = container.find('header');
            if (header.length > 0){
                $('.openerp .oe_application > div > .oe_view_manager > .oe_view_manager_wrapper > div > .oe_view_manager_body').addClass('of_hidden');
                container.find('.oe_form').before(header);
                container.addClass('npp_container');
                container.find('> .oe_form').addClass('of_auto');
            }else{
                $('.openerp .oe_application > div > .oe_view_manager > .oe_view_manager_wrapper > div > .oe_view_manager_body').removeClass('of_hidden');
            }
            $('.oe_form_status').addClass('right');
        },
    });
};

openerp.npp_web_interface = function(instance) {
    custom(instance);
};