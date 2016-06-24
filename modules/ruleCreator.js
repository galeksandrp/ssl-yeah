var fs = require('fs');
const constants = require('./constants.js');

exports.write = function(path, crawler, callback){
	crawler.writingRule = true;
	var stream = fs.createWriteStream(path + '/' + crawler.baseHost + '.xml');
	stream.on('error', function(e){console.log('error writing to file: ' + e)})
	stream.on('finish', function() {crawler.writingRule = false; callback(); });
	write_rule(crawler, stream);
	stream.end();
}

function getTargets(hosts){
	var targets = [];

	hosts.forEach(function(host){
		var status = host.getFinalAssessment();
		if(status == constants['pass'] || status == constants['mixedPassive']){
			targets.push(host.url);
		}
	});
	//TODO - implement wildcard rules if all or a subset of the targets could be summarized by a wildcard expression --> need to add test URLs if we do this.
	return targets.sort();
}

function write_rule(crawler, stream){

	var targets = getTargets(crawler.hosts);
	var name = crawler.baseHost;

	if(targets.length != crawler.hosts.length){
		name = name + ' (partial)';
	}

	stream.write('<!--\r\n\tThis ruleset was created by SSL-Yeah! (https://github.com/guiweber/ssl-yeah) \r\n-->\r\n\r\n');
	stream.write('<!--\r\n\tIMPORTANT - There is still some work to do manually to make sure you have a quality ruleset:\r\n\r\n');
	stream.write('\t1.\r\n\tRead the detailed report generated by SSL-Yeah. By default, sub-hosts with any active mixed content will not be included in the rules, \r\n\tbut if you see that only a few pages are affected, you may want to add that subhost and fine tune the rule.\r\n\r\n');
	stream.write('\t2.\r\n\tA "Secure Cookie" rule has been created for all the sub-hosts in the ruleset, but they need to be tested manually to make sure this does not cause any issue.\r\n\r\n');
	stream.write('\t3.\r\n\tYou might want to change the ruleset name to display the organisation name rather than the base host name.\r\n\r\n');
	stream.write('\t4.\r\n\tMake sure to remove these instructions and to test your new rule carefully before publishing it.\r\n');
	stream.write('-->\r\n');


	stream.write('<ruleset name="'+ name +'">\r\n\r\n');

	targets.forEach(function(target){
		stream.write('\t<target host="'+ target +'" />\r\n');
	});

	stream.write('\r\n');

	targets.forEach(function(target){
		target = target.replace(/\./, '\\.');
		stream.write('\t<securecookie host="^'+ target +'$" name=".+" />\r\n');
	});


	stream.write('\r\n\t<rule from="^http:" to="https:" />\r\n\r\n');

	stream.write('</ruleset>');


}