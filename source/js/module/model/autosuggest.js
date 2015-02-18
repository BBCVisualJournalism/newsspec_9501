define(['lib/news_special/bootstrap'], function (news) {
    var $ = news.$,
        gelui = news.gelui,
        autoSuggest = new gelui.AutoSuggest($('#nhswinter_tracker_form_input_hospital'), ['Say1', 'Saythem2', 'Saysay4']);
    
    autoSuggest.signals.inputchanged.add(function () {
        var hospital = $('#nhswinter_tracker_form_input_hospital').val();
    });
    
    autoSuggest.signals.itemhighlighted.add(function (e) {
        var keyPressed = e.keyPressed,
            keyCode = this.keyCode,
            $item = $(e.item),
            $input = this.$input;
        
        if (keyPressed & (keyPressed === keyCode.DOWNARROW || keyPressed === keyCode.UPARROW)) {
            if ($item.length > 0) {
                $input.val($item.text());
            } else {
                $input.val(usersQuery);
            }
        }
    }, autoSuggest);     
});