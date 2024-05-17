define(['lib/karaokeLibrary'], function(helper){
 return class JoinPartyDlg {
   constructor() {
     var promise = null;
     if(window.location.pathname == '/')
     {
       promise = this.fetchQueues();
     }
     else
     {
       promise = new Promise((resolve,reject)=>{
         var input = $('<input type="text" id="queueId" placeholder="Queue ID" class="form-control mb-3">');
         resolve(input);
       });
     }
     var me = this;

     promise.then((input)=> {
       var div = $('<div id="joinPartyDialog" title="Join Party">');
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
       div.parent().find('.ui-dialog-buttonset button').addClass(
         'btn btn-primary');
       div.parent().find('.ui-dialog-titlebar button').addClass(
         'ui-button ui-icon ui-icon-closethick');
       me.div = div;
       me.open();
     });
   }

   async fetchQueues() {
     var response = await fetch('/api/queue/');
     var queues = await response.json();
     var input = $('<select id="queueId" class="form-control mb-3">');
     queues.forEach(queue => {
       var option = $('<option value="' + queue._id + '">' + queue.name + '</option>');
       input.append(option);
     });
     return input;
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
