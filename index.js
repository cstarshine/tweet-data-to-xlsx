var apiKey;
var apiSecretKey;
var bearerToken;

var xlsx = xlsxController();
var ajax = ajaxController();

const xlsxController = () => {
    var matchRow;

    let tweet;

    $(document).ready(function () {
      matchRow = $(".match_row").html();
    });

    $(".add_row").click(function () {
      $(this).before("<tr class='match_row'>" + matchRow + "</tr>");
    });

    $(".del_row").click(function () {
      $(this).parent().parent().remove();
    });

    function makeNameArray() {
      var nameArray = new Array();

      $(".match_row").each((key, val) => {
        var nameObject = new Object();
        nameObject[$(val).find(".user_id").val()] = $(val).find(".user_name").val();

        nameArray.push(nameObject);
      });

      return nameArray;
    }

    function makeDataArray(nameArray) {
      var dataArray = new Array();

      tweet = $.parseJSON(tweet);

      $.each(tweet, (key, tweetData) => {
        $.each(tweetData, (t, val) => {
          var data = new Object();
          data.date = new Date(val.created_at).toISOString();
          if (val.entities.user_mentions[0] != undefined || val.entities.user_mentions[0] != undefined) {
            data.mention_name = val.entities.user_mentions[0].name;
          } else {
            $.each(nameArray, (index, nameData) => {
              $.each(nameData, (user_id, user_name) => {
                var regex = new RegExp(user_id);
                if (val.full_text.match(regex) != null) {
                  data.mention_name = user_name;
                }
              })
            });
          }
          data.text = val.full_text.replace(/^@\w*\s/, "");

          dataArray.push(data);
        });
      });

      dataArray.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      return dataArray;
    }

    $("#tweet_file").on("change", function(){
      let file = $("#tweet_file")[0].files[0];
      let fr = new FileReader();
      fr.onload = () => {
        var jsonStr = JSON.stringify(fr.result);
        var jsonData = JSON.parse(jsonStr);
        tweet = jsonData;
      };
      fr.readAsText(file);
    })

    function exportExcel() {
      let nameArray = makeNameArray();

      let dataArray = makeDataArray(nameArray);

      var workBook = XLSX.utils.book_new();

      var newWorkSheet = XLSX.utils.json_to_sheet(dataArray);

      XLSX.utils.book_append_sheet(workBook, newWorkSheet, "백업");

      var workBookOut = XLSX.write(workBook, { bookType: 'xlsx', type: 'binary' });

      saveAs(new Blob([s2ab(workBookOut)], { type: "application/octet-stream" }), "백업.xlsx");
    }

    function s2ab(s) {
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }
}

const ajaxController = () => {
    let protocolType;
    let url;
    let data;
    let headerList = {};

    function setProtocol(protocolType) {
        this.protocolType = protocolType;
    }

    function setUrl(url) {
        this.url = url; 
    }

    function setData(data){
        this.data = data;
    }

    function execute() {
        $.ajax({
            type: this.protocolType,
            url: this.url,
            data: this.data,
            beforeSend: function(xhr) {
                $.each(this.headerList, (key, val) => {
                    xhr.setRequestHeader(key, val);
                });
            },
            success: function (response) {
                console.log(response);
            },
            error: function(e) {
                console.log(error);
            }
        });
    }
}