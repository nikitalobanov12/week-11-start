const router = require('express').Router();
const database = include('databaseConnection');
const Joi = require('joi');
const { ObjectId } = require('mongodb');

// const dbModel = include('databaseAccessLayer');
// const dbModel = include('staticData');

const userModel = include('models/web_user');
const petModel = include('models/pet');

const crypto = require('crypto');
const { v4: uuid } = require('uuid');

const passwordPepper = 'SeCretPeppa4MySal+';

router.get('/', async (req, res) => {
	console.log('page hit');
	try {
		const userCollection = database.db('lab_example').collection('users');
		const users = await userCollection.find().project({ first_name: 1, last_name: 1, email: 1, _id: 1 }).toArray();
		if (users === null) {
			res.render('error', { message: 'Error connecting to MySQL' });
			console.log('Error connecting to userModel');
		} else {
			console.log(users);
			res.render('index', { allUsers: users });
		}
	} catch (ex) {
		res.render('error', { message: 'Error connecting to MySQL' });
		console.log('Error connecting to MySQL');
		console.log(ex);
	}
});

router.get('/pets', async (req, res) => {
	console.log('Fetching pets for user');
	try {
		const userId = req.query.userId; // Get userId from query params
		if (!userId) {
			return res.render('error', { message: 'User ID is required' });
		}

		const userCollection = database.db('lab_example').collection('users');
		const user = await userCollection.findOne({ _id: userId });
		if (!user) {
			return res.render('error', { message: 'User not found in MongoDB' });
		}

		const pets = await petModel.findAll({ where: { web_user_id: userId } });
		if (!pets.length) {
			return res.render('pets', { allPets: [], message: 'No pets found for this user' });
		}

		console.log(pets);
		res.render('pets', { allPets: pets });
	} catch (ex) {
		res.render('error', { message: 'Error fetching pets' });
		console.log('Error fetching pets:', ex);
	}
});

router.get('/showPets', async (req, res) => {
    try {
        console.log('Fetching pets for user');
        const userId = req.query.id;

        if (!userId) {
            return res.render('error', { message: 'User ID is required' });
        }

        const petCollection = database.db('lab_example').collection('pets');
        const pets = await petCollection.find({ user_id: userId }).toArray();

        if (!pets.length) {
            return res.render('pets', { allPets: [], message: 'No pets found for this user' });
        }

        console.log(pets);
        res.render('pets', { allPets: pets });
    } catch (ex) {
        console.log('Error fetching pets:', ex);
        res.render('error', { message: 'Error fetching pets' });
    }
});

router.get('/deleteUser', async (req, res) => {
	try {
		console.log('Deleting user');
		const userId = req.query.id;

		if (!userId || userId.trim() === '') {
			return res.render('error', { message: 'User ID is required and cannot be empty' });
		}

		const userCollection = database.db('lab_example').collection('users');
		const petCollection = database.db('lab_example').collection('pets');

		console.log('Deleting associated pets...');
		await petCollection.deleteMany({ user_id: userId });

		console.log('Deleting user...');
		const result = await userCollection.deleteOne({ _id: new ObjectId(userId) });

		if (result.deletedCount === 0) {
			return res.render('error', { message: 'User not found in MongoDB' });
		}

		console.log(`User ${userId} and their pets deleted successfully`);
		res.redirect('/');
	} catch (ex) {
		console.log('Error deleting user:', ex);
		res.render('error', { message: 'Error deleting user' });
	}
});
router.post('/addUser', async (req, res) => {
	try {
		console.log('Adding a new user');

		const schema = Joi.object({
			first_name: Joi.string().max(50).required(),
			last_name: Joi.string().max(50).required(),
			email: Joi.string().email().required(),
			password: Joi.string().min(8).required(),
		});

		const { error, value } = schema.validate(req.body);
		if (error) {
			return res.render('error', { message: 'Invalid input: ' + error.details[0].message });
		}

		const password_salt = crypto.createHash('sha512').update(uuid()).digest('hex');
		const password_hash = crypto
			.createHash('sha512')
			.update(req.body.password + passwordPepper + password_salt)
			.digest('hex');

		const userCollection = database.db('lab_example').collection('users');
		const newUser = {
			first_name: value.first_name,
			last_name: value.last_name,
			email: value.email,
			password_salt: password_salt,
			password_hash: password_hash,
		};

		await userCollection.insertOne(newUser);
		console.log('User added successfully');
		res.redirect('/');
	} catch (ex) {
		console.log('Error adding user:', ex);
		res.render('error', { message: 'Error adding user' });
	}
});

/*
router.get('/', (req, res) => {
	console.log("page hit");
	database.getConnection(function (err, dbConnection) {
		if (err) {
			res.render('error', {message: 'Error connecting to MySQL'});
			console.log("Error connecting to mysql");
			console.log(err);
		}
		else {
			
			dbModel.getAllUsers((err, result) => {
				if (err) {
					res.render('error', {message: 'Error reading from MySQL'});
					console.log("Error reading from mysql");
					console.log(err);
				}
				else { //success
					res.render('index', {allUsers: result});

					//Output the results of the query to the Heroku Logs
					console.log(result);
				}
			});
			dbConnection.release();
		}
	});
});
*/

/*
router.post('/addUser', (req, res) => {
	console.log("form submit");
	database.getConnection(function (err, dbConnection) {
		if (err) {
			res.render('error', {message: 'Error connecting to MySQL'});
			console.log("Error connecting to mysql");
			console.log(err);
		}
		else {
			console.log(req.body);
			dbModel.addUser(req.body, (err, result) => {
				if (err) {
					res.render('error', {message: 'Error writing to MySQL'});
					console.log("Error writing to mysql");
					console.log(err);
				}
				else { //success
					res.redirect("/");

					//Output the results of the query to the Heroku Logs
					console.log(result);
				}
			});
			
			dbConnection.release();
		}
	});

});
*/

/*
router.get('/deleteUser', (req, res) => {
	console.log("delete user");
	database.getConnection(function (err, dbConnection) {
		if (err) {
			res.render('error', {message: 'Error connecting to MySQL'});
			console.log("Error connecting to mysql");
			console.log(err);
		}
		else {
			console.log(req.query);

			let userId = req.query.id;
			if (userId) {
				dbModel.deleteUser(userId, (err, result) => {
					if (err) {
						res.render('error', {message: 'Error writing to MySQL'});
						console.log("Error writing to mysql");
						console.log(err);
					}
					else { //success
						res.redirect("/");

						//Output the results of the query to the Heroku Logs
						console.log(result);
					}
				});
			}
			else {
				res.render('error', {message: 'Error on Delete'});
			}
		
			dbConnection.release();
		}
	});
});
*/

module.exports = router;
