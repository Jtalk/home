
print('Creating collection Articles');

function asIso(prefix, suffix, hour) {
	let hourString = '' + (hour + 1);
	if (hourString.length === 1) {
		hourString = '0' + hourString;
	}
	return prefix + hourString + suffix;
}

db.articles.createIndex({id: 1}, {unique: true});
db.articles.createIndex({
	title: "text",
	id: "text",
	content: "text",
	tags: "text"
}, {
	weights: {
		title: 3,
		id: 2
	}
})
db.articles.insert({
	title: 'Test Article 1',
	id: 'test-article',
	published: true,
	created: '2020-01-20T10:00:01Z',
	content: '# A very cool test article\n<preview>Once upon a time...</preview>\nOther content',
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
Array(20).fill().forEach((_, i) => {
	db.articles.insert({
		title: 'Test Article ' + (i + 3),
		id: 'test-article-' + (i + 3),
		published: true,
		created: asIso('2020-01-20T', ':00:01Z', (i + 1)),
		content: '<preview>A very cool test article</preview>',
		tags: ["Java", "Scala"]
	});
});
db.articles.insert({
	title: 'Last Test Article',
	id: 'last-test-article',
	published: false,
	created: '2020-01-22T14:00:01Z',
	content: '# Another very cool test article\n<preview>Preview going ahead...</preview>\nSomething something',
	tags: []
});
print('Created collection Articles');