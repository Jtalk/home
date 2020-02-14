
print('Creating collection Articles');

db.articles.insert({
	title: 'Test Article 1',
	id: 'test-article',
	published: true,
	created: '2020-01-20T10:00:01Z',
	content: 'A very cool test article',
	tags: ["Java", "Scala"]
});
db.articles.insert({
	title: 'Test Article 2',
	id: 'another-test-article',
	published: false,
	created: '2020-01-22T14:00:01Z',
	content: 'Another very cool test article',
	tags: []
});
print('Created collection Articles');