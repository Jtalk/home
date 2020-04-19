

print('Creating collection Footer');
db.createCollection('footer');
db.footer.insert({
	links: [
		{ caption: 'About', href: '/' },
		{ caption: 'Source', href: 'https://github.com/Jtalk/home/' },
		{ caption: 'LinkedIn', href: 'https://linkedin.com/' }
	],
	logos: [
	]
});
print('Collection Footer created');