define(['lib/karaokeLibrary'], function(helper){
 return class JoinPartyDlg {
   constructor() {
     var div = $('<div id="joinPartyDialog" title="Join Party">');
     var input = $('<input type="text" id="queueId" placeholder="Queue ID" class="form-control mb-3">');
     div.append(input);
     div.dialog({
       dialogClass: "no-close",
       autoOpen: false,
       modal: true,
       resizable: false,
       closeOnEscape: false,
       close: function (event, ui) {
         div.dialog('destroy');
         div.remove();
       },
       buttons: {
         Join: this.joinParty.bind(this),
         Cancel: this.handleCancel.bind(this)
        }
     });
     div.parent().find('.ui-dialog-buttonset button').addClass('btn btn-primary');
     div.parent().find('.ui-dialog-titlebar button').addClass('ui-button ui-icon ui-icon-closethick');
     this.div = div;

   }

   handleCancel()
   {
     if(localStorage.getItem('queueId') == null)
     {
       if(!$('#queueId').hasClass('is-invalid')) {
         $('#queueId').addClass('is-invalid');
       }
       if(this.div.find('.invalid-feedback').length == 0)
       {
         this.div.append("<div class='invalid-feedback'>You must join a party!</div>");
       }
       return;
     }
     this.div.dialog('close');
   }

   joinParty() {
     var queueId = $('#queueId').val();
     if(queueId == '') {
       if(!$('#queueId').hasClass('is-invalid')) {
         $('#queueId').addClass('is-invalid');
       }
       if(this.div.find('.invalid-feedback').length == 0)
       {
         this.div.append("<div class='invalid-feedback'>Queue ID is required</div>");
       }
       return;
     }
     localStorage.setItem('queueId', queueId);
     this.div.trigger('queueUpdated');
     this.div.trigger('refreshQueue');
     this.div.dialog('close');
   }

   open() {
     this.div.dialog("open");
   }
 }
});
