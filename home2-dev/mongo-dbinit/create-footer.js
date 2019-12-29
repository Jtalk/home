

print('Creating collection Footer');
db.createCollection('footer');
db.footer.insert({
	links: [
		{ caption: 'About', href: '/' },
		{ caption: 'Source', href: 'https://github.com/Jtalk/home/' },
		{ caption: 'LinkedIn', href: 'https://linkedin.com/' }
	],
	logos: [
		{ name: 'AGPLv3', src: 'https://jtalk.me/home/resources/images/logo_agplv3.svg', href: 'https://www.gnu.org/licenses/agpl-3.0.html' },
		{ name: 'Java', src: 'https://jtalk.me/home/resources/images/logo_java.png', href: 'https://java.com' }
	]
});
print('Collection Footer created');