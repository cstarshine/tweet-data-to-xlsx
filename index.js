var xlsxController = {
    matchRow: "",
    initEvent: function () {
        $(".add_row").click(function () {
            $(this).before("<tr class='match_row'>" + this.matchRow + "</tr>");
        });
        $(".del_row").click(function () {
            $(this).parent().parent().remove();
        });
    },
    initFunc: function () {
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
            if (typeof tweet == undefined) {
                return false;
            }
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
        $("#tweet_file").on("change", function () {
            let file = $("#tweet_file")[0].files[0];
            let fr = new FileReader();
            fr.onload = () => {
                var jsonStr = JSON.stringify(fr.result);
                var jsonData = JSON.parse(jsonStr);
                tweet = jsonData;
            };
            fr.readAsText(file);
        });
    },
    run: function () {
        this.matchRow = $(".match_row").html();
        this.initEvent();
        this.initFunc();
    }
}

var ajaxController = {
    protocolType: "",
    url: "",
    data: "",
    dataType: "",
    headerList: {},
    setProtocol: function (protocolType) {
        this.protocolType = protocolType;
    },
    setUrl: function (url) {
        this.url = url;
    },
    setData: function (data, dataType) {
        this.data = data;
    },
    addHeaderList: function (headerType, headerValue) {
        this.headerList[headerType] = headerValue;
    },
    execute: function() {
        var self = this;
        $.ajax({
            type: self.protocolType,
            url: self.url,
            data: self.data,
            dataType: self.dataType,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                $.each(self.headerList, (key, val) => {
                    xhr.setRequestHeader(key, val);
                });
            },
            success: function (response) {
                console.log(response);
            },
            error: function (e) {
                console.log(error);
            }
        });
    }
}

var xlsx = xlsxController;
var ajax = ajaxController;

$("#devExportExcel").click(function () {
    xlsx.exportExcel();
})

ajax.setProtocol("GET");
ajax.addHeaderList("Authorization", "Bearer 3246597894-pdkBRZlE7D17fEg1lsKxv9JCulnh7Aq1x3hoyOV")
ajax.setUrl("https://api.twitter.com/2/users/by/username/starshine");
ajax.execute();