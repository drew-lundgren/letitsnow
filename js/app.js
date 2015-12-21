window.onload = function() {
    main();
};

function main() {
    _getData();
}


// $.ajaxPrefilter(function(options) {
//     if (options.crossDomain && jQuery.support.cors) {
//         var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
//         options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
//         //options.url = "http://cors.corsproxy.io/url=" + options.url;
//     }
// });
// $.get("http://www.nws.noaa.gov/view/prodsByState.php?state=MN&prodtype=public")
//     .done(
//         function(data) {
//             parse(data);
//         });
function _getData() {
    var request = new XMLHttpRequest();
    request.open('GET', 'http://cors-anywhere.herokuapp.com/nws.noaa.gov/view/prodsByState.php?state=MN&prodtype=public', true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var data = request.responseText;
        _parse(data);
      } else {
        // We reached our target server, but it returned an error
        console.log('server error', request);
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
      console.log('error', request);
    };

    request.send();
}





function _parse(raw) {
    //  console.log(raw.indexOf('\n'));
    //var re = /(..REMARKS..[^]*?&&)/,
    //  matches = raw.match(re);
    var regexs = {
            latLng: /\d{2}\.\d{2}[N]\s\d{2}\.\d{2}[W]/,
            value: /\d{1,2}\.\d{1,2}(?=\sINCH)/,
            date: /\d{2}\/\d{2}\/\d{4}/,
            time: /(\d{4}\s(AM|PM))/
        },
        records = [],
        data = {},
        matches = raw.split('<pre>');

    // console.log(regexs);
    console.log('matches', matches);

    // loop through rows
    matches.forEach( function(row) {
        // exit if it's not a weather snippet
        if (row.substr(2, 3) != '000') {
            return false;
        }
        // set the date
        var theDate = new Date(row.match(regexs.date)[0]),
            theTime = row.match(regexs.time)[0],
            hours = theTime.substr(-2) == 'AM' ? theTime.substr(0,2) : theTime.substr(0,2) + 12;
        // set the time
        theDate.setHours(hours);
        theDate.setMinutes(theTime.substr(2,2));

        // populate data
        data = {
            latLng: row.match(regexs.latLng)[0],
            value: row.match(regexs.value)[0],
            datetime: theDate
        };


        records.push(data);
    });

    console.log('records', records);
}