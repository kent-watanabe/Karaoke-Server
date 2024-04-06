define([],function () {
  return class Grid {
    constructor(props) {
      if(props == null) {
        throw new Error("Props need to be defined!");
      }
      $.extend(this, props);

      if(this.containerID == null) {
        throw new Error("containerID is not defined!");
      }

      this.getID = helper.getID.bind(this);
      this.getJquerySelector = helper.getJquerySelector.bind(this);

      var container = $(this.getJquerySelector(''));
      if(this.width) {
        container.width(this.width);
      }
      if(this.height) {
        container.height(this.height);
      }

      this.cssClassList = {
        gridTable: 'gridTable',
        gridHeader: 'gridHeader',
        gridColumnHeader: 'gridColumnHeader',
        gridBody: 'gridBody',
        gridRow: 'gridRow',
        gridColumn: 'gridColumn'
      };

      if(this.cssPrefix) {
        for(var key in this.cssClassList) {
          this.cssClassList[key] = this.cssPrefix +'-'+ this.cssClassList[key];
        }
      }

      var table = helper.createDOMObject('<table>', this.containerID + "-grid-table", this.cssClassList['gridTable']);
      container.append(table);

      var tableHeader = $('<thead>');
      var header = helper.createDOMObject('<th>', this.containerID + "-grid-header", this.cssClassList['gridHeader']);
      this.columns.forEach(function(column) {
        var td = helper.createDOMObject('<td>', '', this.cssClassList['gridColumnHeader']);
        if(column.button) {
          td.text('');
        }
        else
        {
          td.attr('data-column', column.propertyName);
          td.text(column.label);
        }
        if(column.width) {
          td.width(column.width);
        }
        header.append(td);
      }.bind(this));
      tableHeader.append(header);
      table.append(tableHeader);
      table.append( helper.createDOMObject('<tbody>', this.containerID + "-grid-body", this.cssClassList['gridBody']));
    }

    setData(data) {
      if(data == null) {
        throw new Error("Data is not defined!");
      }
      this.data = data;
      this.render();
    }

    addRow(row) {
      if(row == null) {
        throw new Error("Row is not defined!");
      }
      if(this.data == null) {
        this.data = [];
      }

      this.data.push(row);
      this.render();
    }

    removeFirstRow() {
      return this.data.shift();
      this.render();
    }

    removeRow(row) {
      if(row == null) {
        throw new Error("Row is not defined!");
      }
      if(this.data != null) {
        for (var item in this.data) {
          if (item.id === row.id) {
            this.data.splice(item, 1);
            break;
          }
        }
      }
      this.render();
    }

    getRowCount() {
      return this.data.length;
    }

    getFirstRow(){
      return this.data[0];
    }

    find(id) {
      return this.data.find(function(row) {
        return row.id == id;
      });
    }

    render() {
      const gridData = $(this.getJquerySelector('grid-body'));
      gridData.empty();
      var alternate = false;
      this.data.forEach(function(row) {
        var tr = helper.createDOMObject('<tr>');
        tr.attr('data-id', row.id);
        if (this.alternateRowColors) {
          if (alternate) {
            tr.addClass(this.cssClassList['gridRow'] +'-even');
          } else {
            tr.addClass(this.cssClassList['gridRow'] +'-odd');
          }
          alternate = !alternate;
        }
        else
        {
          tr.addClass(this.cssClassList['gridRow']);
        }
        this.columns.forEach(function(column) {
          var td = helper.createDOMObject('<td>', '', this.cssClassList['gridColumn']);
          if(column.button) {
            var button = helper.createDOMObject('<button>');
            if( column.button.cssClass) {
              button.addClass(column.button.cssClass);
            }
            else {
              button.text(column.button.label);
            }

            if(column.button.width) {
              button.width(column.button.width);
            }

            button.on('click', column.handler);
            td.append(button);
          }
          else
          {
            td.text(row[column.propertyName]);
            if(column.width) {
              td.width(column.width);
            }
          }

          tr.append(td);
        }.bind(this));
        gridData.append(tr);
      }.bind(this));
    }
  }
});
