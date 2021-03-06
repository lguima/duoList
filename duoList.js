;
(function ( $, window, undefined ) {
    var pluginName = 'duoList',
    document = window.document,
    defaults = {
        destiny: undefined,
        buttonAdd: undefined,
        buttonAddAll: undefined,
        buttonRemove: undefined,
        buttonRemoveAll: undefined,
        optionsLimit: 0,
        dblClick: false
    };

    function Plugin( element, options ) {
        this.element = element;

        this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;

        if (isReady(this.options))
            this.init();
    }

    function isDefined(variable){
        return typeof variable != 'undefined';
    }

    function isReady(options){
        var ready = false;

        ready = isDefined(options.destiny) && isDefined(options.buttonAdd) && isDefined(options.buttonRemove);
        if (!ready)
        {
            console.error('\'2ist\' - As propriedades \'destiny\', \'buttonAdd\' e \'buttonRemove\' são obrigatórias');
            return ready;
        }

        ready = $(options.destiny).is('select[multiple]');
        if (!ready)
        {
            console.error('\'2ist\' - A propriedade \'destiny\' deve ser um <select multiple="multiple">');
            return ready;
        }

        ready = $(options.buttonAdd).is('input[type="button"]') && $(options.buttonRemove).is('input[type="button"]');
        if (!ready)
        {
            console.error('\'2ist\' - As propriedades \'buttonAdd\' e \'buttonRemove\' devem ser <input type="button" />');
            return ready;
        }

        ready = (!isDefined(options.buttonAddAll) || (isDefined(options.buttonAddAll) && $(options.buttonAddAll).is('input[type="button"]'))) && (!isDefined(options.buttonRemoveAll) || (isDefined(options.buttonRemoveAll) && $(options.buttonRemoveAll).is('input[type="button"]')));
        if (!ready)
        {
            console.error('\'2ist\' - As propriedades \'buttonAddAll\' e \'buttonRemoveAll\' devem ser <input type="button" />');
            return ready;
        }

        ready = !(isDefined(options.buttonAddAll) && (isDefined(options.optionsLimit) && options.optionsLimit > 0));
        if (!ready)
        {
            console.error('It is not possible to define a button to add all options (\'buttonAddAll\') when exists a options limit (\'optionsLimit\')');
            return ready;
        }

        return ready;
    }

    function sortAlphabetically($list){
        return $list.sort(function(x, y){
            x = $list.eq($list.index(x)).val();
            y = $list.eq($list.index(y)).val();
            return (x - y);
        });
    }

    function resetButtons(options){
        var $button = $(options.buttonAdd);
        if ($button.length > 0)
            if ($button.is(':enabled'))
                $button.attr('disabled', 'disabled');
        
        $button = $(options.buttonRemove);
        if ($button.length > 0)
            if ($button.is(':enabled'))
                $button.attr('disabled', 'disabled');

        $button = $(options.buttonRemoveAll);
        if ($button.length > 0)
            if ($button.is(':enabled'))
                $button.attr('disabled', 'disabled');
    }

    Plugin.prototype.init = function(){
        var options = this.options;
        resetButtons(options);
        
        var $origin =  $(this.element);
        var $destiny = $(options.destiny);

        var $add = $(options.buttonAdd);
        var $addAll = $(options.buttonAddAll);        
        var $remove = $(options.buttonRemove);
        var $removeAll = $(options.buttonRemoveAll);

        $origin.change(function(){            
            var $selected = $origin.find('option:selected');
            var $added = $destiny.find('option');
            var onLimit = true;

            if (options.optionsLimit > 0)
                onLimit = $added.length < options.optionsLimit && ($added.length + $selected.length) <= options.optionsLimit;

            if (onLimit)
                $add.removeAttr('disabled');
            else if ($add.not(':disabled'))
                $add.attr('disabled', 'disabled');
        });

        $add.click(function(){
            var $selected = $origin.find('option:selected');
            var onLimit = true;

            if ($selected.length > 0){
                var $added = $destiny.find('option');

                if (options.optionsLimit > 0)
                    onLimit = $added.length < options.optionsLimit && ($added.length + $selected.length) <= options.optionsLimit;
                
                if (onLimit){
                    var $allOptions = $.merge($added, $selected);
                    $allOptions = sortAlphabetically($allOptions);

                    $destiny.html($allOptions);
                    $destiny.find('option').removeAttr('selected');

                    $add.attr('disabled', 'disabled');
                    $remove.attr('disabled', 'disabled');
                    if ($removeAll.length > 0) $removeAll.removeAttr('disabled');
                }
            }
        });

        if (isDefined($addAll)){
            $addAll.click(function(){
                var $toAdd = $origin.find('option');
                var $selected = $destiny.find('option');
                var $allOptions = sortAlphabetically($.merge($toAdd, $selected));

                $destiny.html($allOptions);
                $destiny.find('option').removeAttr('selected');

                $add.attr('disabled', 'disabled');
                $remove.attr('disabled', 'disabled');
                
                $addAll.attr('disabled', 'disabled');
                if ($removeAll.length > 0) $removeAll.removeAttr('disabled');
            });
        }

        $remove.click(function(){
            var $selected = $destiny.find('option:selected');
            var $toAdd = $origin.find('option');
            var $allOptions = sortAlphabetically($.merge($toAdd, $selected));

            $origin.html($allOptions);
            $origin.find('option').removeAttr('selected');
            
            $add.attr('disabled', 'disabled');
            $remove.attr('disabled', 'disabled');
            
            var $added = $destiny.find('option');
            if ($added.length == 0 && $removeAll.length > 0) $removeAll.attr('disabled', 'disabled');
        });

        if (isDefined($removeAll)){
            $removeAll.click(function(){
                var $selected = $destiny.find('option');

                if ($selected.length > 0){
                    var $options = $origin.find('option');
                    var $allOptions = sortAlphabetically($.merge($options, $selected));

                    $origin.html($allOptions);
                    $origin.find('option').removeAttr('selected');

                    $add.attr('disabled', 'disabled');
                    $remove.attr('disabled', 'disabled');

                    if ($addAll.length > 0) $addAll.removeAttr('disabled');
                    $removeAll.attr('disabled', 'disabled');
                }
            });
        }

        $destiny.change(function(){            
            if ($destiny.has('option:selected'))
                $remove.removeAttr('disabled');
            else if ($remove.not(':disabled'))
                $remove.attr('disabled', 'disabled');
        });

        if (options.dblClick){
            $origin.find('option').on('dblclick', function(){
                $add.trigger('click');
            });

            $destiny.find('option').on('dblclick', function(){
                $remove.trigger('click');
            });
        }
    };

    $.fn[pluginName] = function(options){
        return this.each(function(){
            if (!$.data(this, 'plugin_' + pluginName)){
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });
    }
}(jQuery, window));
