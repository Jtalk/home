
print('Creating collection Projects');

logoId = db['fs.files'].findOne({filename: 'project.png'})._id
print('Using GridFS object as the project\'s photo: ' + logoId);

db.projects.createIndex({id: 1}, {unique: true});
db.projects.createIndex({
	title: "text",
	id: "text",
	description: "text",
	links: "text",
}, {
	weights: {
		title: 3,
		id: 2
	}
})
db.projects.insert({
	title: 'Test Project 1',
	id: 'test-project',
	order: 0,
	description: '# A very cool test project\nNuff said',
	logoId: logoId,
	published: true,
	links: [
		{ name: 'Website', href: 'https://jtalk.me' },
		{ name: 'Source', href: 'https://github.com' },
		{ name: 'Demo', href: 'https://example.com' }
	]
});
db.projects.insert({
	title: 'Test Project 2',
	id: 'another-test-project',
	order: 1,
	description: '# Another very cool test project\nA description for this very cool project',
	logoId: '',
	published: false,
	links: [
		{ name: 'Website', href: 'https://jtalk.me' },
		{ name: 'Source', href: 'https://github.com' },
		{ name: 'Demo', href: 'https://example.com' }
	]
});
print('Created collection Projects');