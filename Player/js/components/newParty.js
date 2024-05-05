define(['lib/karaokeLibrary'], function (helper) {
  return class NewPartyDlg {
    constructor() {
      var div = $('<div id="newPartyDialog" title="Create New Party">');
      var nameInput = $(
        '<input type="text" id="name" placeholder="Name" class="form-control mb-3">');
      var descriptionInput = $(
        '<input type="text" id="description" placeholder="Description" class="form-control mb-3">');
      div.append(nameInput);
      div.append(descriptionInput);
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
          Create: this.createParty.bind(this),
          Cancel: this.handleCancel.bind(this)
        }
      });
      div.parent().find('.ui-dialog-buttonset button').addClass(
        'btn btn-primary');
      div.parent().find('.ui-dialog-titlebar button').addClass(
        'ui-button ui-icon ui-icon-closethick');
      this.div = div;

    }

    handleCancel() {
      this.div.dialog('close');
    }

    createParty() {
      var name = $('#name').val();
      var description = $('#description').val();
      fetch(
        '/api/queue/', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': helper.getXSRFToken()
          },
          body: JSON.stringify({
            name: name,
            description: description
          })
        }).then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Failed to create party');
      }).then(data => {
        localStorage.setItem('queueId', data.id);
        this.div.trigger('queueUpdated');
        this.div.trigger('refreshQueue');
        this.div.dialog('close');
      });
    }

    open() {
      this.div.dialog("open");
    }
  }
})
;
