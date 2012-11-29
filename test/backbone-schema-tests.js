var Backbone = require('backbone'),
    _        = require('underscore'),
    assert   = require('chai').assert;

var BackboneSchema = require('..');

describe('Backbone.Schema', function() {

    var SchemaFactory = new Backbone.SchemaFactory(),
        SchemaModel = Backbone.SchemaModel,
        SchemaCollection = Backbone.SchemaCollection,
        SchemaValueCollection = Backbone.SchemaValueCollection,
        SchemaTestHelper = Backbone.SchemaTestHelper;

    var registerSchemas = function() {
        // Register some test schemas:
        SchemaFactory.register({
            "id": "/backbone.schema/tests/person",
            "title": "Person",
            "type": "object",
            "properties": {
                "id": {
                    "type": "integer"
                },
                "name": {
                    "type": "string",
                    "required": true
                },
                "surname": {
                    "type": "string",
                    "required": true
                },
                "address": {
                    "$ref": "/backbone.schema/tests/address#"
                },
                "homePhoneNumber": {
                    "$ref": "/backbone.schema/tests/phone-number#"
                },
                "mobilePhoneNumber": {
                    "$ref": "/backbone.schema/tests/phone-number#"
                },
                "spouse": {
                    "$ref": "#"
                },
                "friends": {
                    "type": "array",
                    "items": {
                        "$ref": "#"
                    }
                }
            }
        }, SchemaModel.extend({
            fullName: function() {
                return this.get('name') + ' ' + this.get('surname');
            }
        }));

        SchemaFactory.register({
            "id": "/backbone.schema/tests/companies",
            "title": "Companies",
            "type": "array",
            "items": {
                "$ref": "/backbone.schema/tests/company#"
            }
        }, SchemaCollection.extend({
            count: function() {
                return this.length;
            }
        }));

        SchemaFactory.register({
            "id": "/backbone.schema/tests/company",
            "title": "Company",
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "required": true
                },
                "address": {
                    "extends": "/backbone.schema/tests/address#",
                    "required": true
                },
                "phoneNumbers": {
                    "$ref": "/backbone.schema/tests/phone-numbers#"
                },
                "employees": {
                    "type": "array",
                    "items": {
                        "$ref": "/backbone.schema/tests/employee#"
                    }
                }
            }
        });

        SchemaFactory.register({
            "id": "/backbone.schema/tests/employee",
            "title": "Employee",
            "type": "object",
            "extends": {
                "$ref": "/backbone.schema/tests/person#"
            },
            "properties": {
                "joinDate": {
                    "type": "date",
                    "required": true
                },
                "reportsTo": {
                    "$ref": "#"
                }
            }
        });

        SchemaFactory.register({
            "id": "/backbone.schema/tests/address",
            "title": "Address",
            "type": "object",
            "properties": {
                "streetNumber": {
                    "type": "string"
                },
                "addressLine1": {
                    "type": "string"
                },
                "addressLine2": {
                    "type": "string"
                },
                "town": {
                    "type": "string"
                },
                "city": {
                    "type": "string"
                },
                "country": {
                    "type": "string"
                }
            }
        });

        SchemaFactory.register({
            "id": "/backbone.schema/tests/phone-numbers",
            "title": "Phone Numbers",
            "type": "array",
            "items": {
                "$ref": "/backbone.schema/tests/phone-number#"
            }
        });

        SchemaFactory.register({
            "id": "/backbone.schema/tests/phone-number",
            "title": "Phone Number",
            "type": "object",
            "properties": {
                "countryCode": {
                    "type": "string"
                },
                "areaCode": {
                    "type": "string"
                },
                "number": {
                    "type": "string"
                }
            }
        });

        SchemaFactory.register({
            "id": "/backbone.schema/tests/validation/required",
            "title": "Validation - Required",
            "properties": {
                "requiredProperty": {
                    "type": "string",
                    "required": true
                },
                "requiredPropertyWithDefault": {
                    "type": "string",
                    "required": true,
                    "default": "Default Value"
                },
                "explicitOptionalProperty": {
                    "type": "string",
                    "required": false
                },
                "explicitOptionalPropertyWithDefault": {
                    "type": "string",
                    "required": false,
                    "default": "Default Value"
                },
                "implicitOptionalProperty": {
                    "type": "string"
                },
                "implicitOptionalPropertyWithDefault": {
                    "type": "string",
                    "default": "Default Value"
                }
            }
        });

        SchemaFactory.register({
            "id": "/backbone.schema/tests/validation/maxLength",
            "title": "Validation - maxLength",
            "properties": {
                "enforcedLengthProperty": {
                    "type": "string",
                    "maxLength": 10
                },
                "anyLengthProperty": {
                    "type": "string"
                }
            }
        });

        SchemaFactory.register({
            "id": "/backbone.schema/tests/validation/minLength",
            "title": "Validation - minLength",
            "properties": {
                "enforcedLengthProperty": {
                    "type": "string",
                    "minLength": 10
                },
                "anyLengthProperty": {
                    "type": "string"
                }
            }
        });
    };

    var validationTestSchema = {
        "id": "/backbone.schema/tests/validation/",
        "title": "Validation",
        "properties": {}
    };

    var validationTestSchemaProperties = {
        "required": {
            "type": "string",
            "required": true
        },
        "requiredWithDefault": {
            "type": "string",
            "required": true,
            "default": "Default Value"
        },
        "explicitOptional": {
            "type": "string",
            "required": false
        },
        "explicitOptionalWithDefault": {
            "type": "string",
            "required": false,
            "default": "Default Value"
        },
        "implicitOptional": {
            "type": "string"
        },
        "implicitOptionalWithDefault": {
            "type": "string",
            "default": "Default Value"
        },
        "minLength": {
            "type": "string",
            "minLength": 5
        },
        "maxLength": {
            "type": "string",
            "maxLength": 5
        },
        "minimum": {
            "type": "integer",
            "minimum": 5
        },
        "exclusiveMinimum": {
            "type": "integer",
            "minimum": 5,
            "exclusiveMinimum" : true
        },
        "maximum": {
            "type": "integer",
            "maximum": 5
        },
        "exclusiveMaximum": {
            "type": "integer",
            "maximum": 5,
            "exclusiveMaximum" : true
        },
        "divisibleBy": {
            "type": "integer",
            "divisibleBy": 5
        },
        "format$email": {
            "type": "string",
            "format": "email"
        },
        "pattern": {
            "type": "string",
            "pattern": "^[a-z]+$"
        },
        "minItems": {
            "title": "MinItems",
            "type": "array",
            "minItems": 2,
            "items": {
                "type": "string"
            }
        },
        "maxItems": {
            "title": "MaxItems",
            "type": "array",
            "maxItems": 2,
            "items": {
                "type": "string"
            }
        },
        "uniqueItems": {
            "title": "UniqueItems",
            "type": "array",
            "uniqueItems": true,
            "items": {
                "type": "string"
            }
        }
    };

    var ModelValidationTester = function(property, initialValue) {
        this.property = property.split('$', 1)[0];

        var attributes = {};
        if(initialValue) {
            attributes[this.property] = initialValue;
        }

        var schema = _.clone(validationTestSchema);
        schema.id = schema.id + this.property;
        schema.properties[this.property] = validationTestSchemaProperties[property];

        this.model = new(SchemaFactory.create(schema))(attributes);
    };

    ModelValidationTester.prototype = {

        isValid: function(value, options) {
            if(value) {
                this.model.set(this.property, value);
            }
            return this.model.isValid(options);
        },

        testModelErrors: function(value, expectedBrokenRule) {

            if(value) {
                this.model.set(this.property, value);
            }

            var errors = this.model.validation.get(this.property);

            if(errors === undefined || errors.length === 0) {
                return false;
            }

            var rule = errors.at(0).get('rule');

            return rule && expectedBrokenRule ? rule == expectedBrokenRule : rule == this.property;
        },

        testCollectionErrors: function(expectedBrokenRule) {
            this.model.get(this.property).isValid();
            var errors = this.model.get(this.property).validation;

            if(errors === undefined || errors.length === 0) {
                return false;
            }

            var rule = errors.at(0).get('rule');

            return rule && expectedBrokenRule ? rule == expectedBrokenRule : rule == this.property;
        }
    };

    var tester;

    var register = function(schema, model) {
        SchemaFactory.register(schema, model);
    };
    var parse = function(schema) {
        register(schema);
        return SchemaFactory.parse(schema, schema);
    };

    var schema;

    beforeEach(function() {
        SchemaFactory.reset();
    });

    describe('SchemaFactory', function() {

        it('should be able to retrieve a registered schema', function() {
            var schemaId = "/tests/Backbone.Schema/SchemaFactory/should be able to retrieve a registered schema";

            var newSchema = {
                "id": schemaId,
                "properties": {
                    "property": {
                        "type": "boolean"
                    }
                }
            };

            var model = SchemaModel.extend();

            SchemaFactory.register(newSchema, model);
            assert.equal(SchemaFactory._get(schemaId), newSchema);
        });

        it('should create a custom model', function() {
            var BaseModel = SchemaModel.extend({
                test: function() {
                    return "pass";
                }
            });

            var TestModel = SchemaFactory.create({
                "type": "object"
            }, BaseModel);

            var testModel = new TestModel();
            assert.instanceOf(testModel, Backbone.Model);
            assert.instanceOf(testModel, SchemaModel);
            assert.instanceOf(testModel, BaseModel);
            assert.equal(testModel.test(), "pass");
        });

        it('should create a custom model from registered', function() {
            var BaseModel = SchemaModel.extend({
                test: function() {
                    return "pass";
                }
            });

            SchemaFactory.register({
                "id": "/test",
                "type": "object"
            }, BaseModel);

            var TestModel = SchemaFactory.create("/test");

            var testModel = new TestModel();
            assert.instanceOf(testModel, Backbone.Model);
            assert.instanceOf(testModel, SchemaModel);
            assert.instanceOf(testModel, BaseModel);
            assert.equal(testModel.test(), "pass");
        });

        it('should create instance using default model', function() {
            var testModel = SchemaFactory.createInstance({
                "type": "object"
            }, {
                id: 456
            });

            assert.instanceOf(testModel, Backbone.Model);
            assert.instanceOf(testModel, SchemaModel);
            assert.equal(testModel.id, 456);
        });

        it('should create instance using a custom model', function() {
            var BaseModel = SchemaModel.extend({
                test: function() {
                    return "pass";
                }
            });

            var testModel = SchemaFactory.createInstance({
                "type": "object"
            }, BaseModel, {
                id: 456
            });

            assert.instanceOf(testModel, Backbone.Model);
            assert.instanceOf(testModel, SchemaModel);
            assert.instanceOf(testModel, BaseModel);
            assert.equal(testModel.test(), "pass");
            assert.equal(testModel.id, 456);
        });

        it('should create instance using a custom registered model', function() {
            var BaseModel = SchemaModel.extend({
                test: function() {
                    return "pass";
                }
            });

            SchemaFactory.register({
                "id": "/test/previously-registered",
                "type": "object"
            }, BaseModel);

            var testModel = SchemaFactory.createInstance("/test/previously-registered", {
                id: 345
            });

            assert.instanceOf(testModel, Backbone.Model);
            assert.instanceOf(testModel, SchemaModel);
            assert.instanceOf(testModel, BaseModel);
            assert.equal(testModel.test(), "pass");
            assert.equal(testModel.id, 345);
        });

        it('should create model instance with deep nested models and collections using regsitered schemas', function() {

            SchemaFactory.register({
                "id": "item",
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string"
                    }
                }
            });

            SchemaFactory.register({
                "id": "collection",
                "type": "array",
                "items": {
                    "$ref": "item"
                }
            });

            var root = SchemaFactory.createInstance({
                "id": "root",
                "type": "object",
                "properties": {
                    "collection": {
                        "$ref": "collection"
                    }
                }
            }, {
                collection: [{ name: "test" }]
            });
            assert.instanceOf(root, SchemaModel);

            var collection = root.get('collection');
            assert.instanceOf(collection, SchemaCollection);

            var item = collection.at(0);
            assert.instanceOf(item, SchemaModel);
        });

        it('should create model instance with deep nested models and collections using created and regsitered schemas', function() {

            var CustomCollection = SchemaCollection.extend({
                test: function() {
                    return "pass";
                }
            });

            var ItemModel = SchemaFactory.create({
                "id": "item",
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string"
                    }
                }
            });

            SchemaFactory.register({
                "id": "collection",
                "type": "array",
                "items": {
                    "$ref": "item"
                }
            }, CustomCollection);

            var root = SchemaFactory.createInstance({
                "id": "root",
                "type": "object",
                "properties": {
                    "collection": {
                        "$ref": "collection"
                    }
                }
            }, {
                collection: [{ name: "test" }]
            });
            assert.instanceOf(root, SchemaModel);

            var collection = root.get('collection');
            assert.instanceOf(collection, SchemaCollection);
            assert.instanceOf(collection, CustomCollection);
            assert.equal(collection.test(), "pass");

            var item = collection.at(0);
            assert.instanceOf(item, SchemaModel);
            assert.instanceOf(item, ItemModel);
        });

    });

    describe('SchemaModel', function() {

        describe('Initialization', function() {

            var IdentityModel = SchemaFactory.create({
                "type": "object",
                "id": '/test/identify'
            });

            var Person;
            beforeEach(function() {
                registerSchemas();
                Person = SchemaFactory.create("/backbone.schema/tests/person");
            });

            it('should create a schema model using a registered schema', function() {
                var person = new Person();
                assert.instanceOf(person, SchemaModel);
                assert.instanceOf(person, Backbone.Model);
                assert.isFunction(person.fullName);
            });

            it('should initialize a schema model with properties', function() {
                var person = new Person({
                    "name": "Marcus",
                    "surname": "Mac Innes"
                });
                assert.equal(person.get('name'), "Marcus");
                assert.equal(person.get('surname'), "Mac Innes");
            });

            it('should initialize a schema model with related model', function() {
                var person = new Person({
                    "spouse": {
                        "name": "Kadija",
                        "surname": "Duiri"
                    }
                });
                var spouse = person.get('spouse');
                assert.equal(spouse.get('name'), "Kadija");
                assert.equal(spouse.get('surname'), "Duiri");
            });

            it('should initialize a schema model with related collection', function() {
                var person = new Person({
                    "friends": [{
                        "name": "Peter",
                        "surname": "Mc Evoy"
                    }, {
                        "name": "Stephen",
                        "surname": "Richardson"
                    }]
                });
                var friends = person.get('friends');
                assert.instanceOf(friends, SchemaCollection);
                assert.equal(friends.at(0).get('name'), "Peter");
                assert.equal(friends.at(0).get('surname'), "Mc Evoy");
                assert.equal(friends.at(1).get('name'), "Stephen");
                assert.equal(friends.at(1).get('surname'), "Richardson");
            });

            it('should lazy initialize related models', function() {
                var person = new Person();
                assert.isUndefined(person.attributes['spouse']);
                var spouse = person.get('spouse');
                assert.isDefined(spouse);
                assert.isDefined(person.attributes['spouse']);
            });

            it('should lazy initialize related collections', function() {
                var person = new Person();
                assert.isUndefined(person.attributes['friends']);
                var friends = person.get('friends');
                assert.isDefined(friends);
                assert.isDefined(person.attributes['friends']);
            });

            it('should return the same object instance when supplied the same ID twice', function() {
                var modelOne = new IdentityModel({
                    id: 1
                });
                var modelTwo = new IdentityModel({
                    id: 1
                });
                var modelThree = new IdentityModel({
                    id: 2
                });
                assert.strictEqual(modelOne, modelTwo, "models with same IDs should be identical");
                assert.notStrictEqual(modelOne, modelThree, "models with different IDs should be different");
            });

            it('should return the different object instance when supplied the same ID twice with identityMap=false', function() {
                var modelOne = new IdentityModel({
                    id: 1
                });
                var modelTwo = new IdentityModel({
                    id: 1
                }, {
                    identityMap: false
                });
                var modelThree = new IdentityModel({
                    id: 2
                });
                assert.notStrictEqual(modelOne, modelTwo, "models with same IDs should be different");
                assert.notStrictEqual(modelOne, modelThree, "models with different IDs should be different");
            });

            it('should return the same object instance when supplied the same ID2 twice (custom idAttribute)', function() {
                var CustomIDModel = IdentityModel.extend({
                    idAttribute: 'custom'
                });
                var modelOne = new CustomIDModel({
                    custom: 1
                });
                var modelTwo = new CustomIDModel({
                    custom: 1
                });
                var modelThree = new CustomIDModel({
                    custom: 2
                });
                assert.strictEqual(modelOne, modelTwo);
                assert.notStrictEqual(modelOne, modelThree);
            });

            it('should initialize a circular reference', function() {
                var schemaA = {
                    "id": "/backbone.schema/tests/a",
                    "type": "object",
                    "properties": {
                        "aa": {
                            "type": "object",
                            "properties": {
                                "aaa": {
                                    "$ref": "/backbone.schema/tests/b#/properties/bb"
                                }
                            }
                        }
                    }
                };

                var schemaB = {
                    "id": "/backbone.schema/tests/b",
                    "type": "object",
                    "properties": {
                        "bb": {
                            "type": "object",
                            "properties": {
                                "bbb": {
                                    "$ref": "/backbone.schema/tests/a#/properties/aa"
                                }
                            }
                        }
                    }
                };

                register(schemaA);
                register(schemaB);

                var ModelA = SchemaFactory.create(schemaA);
                assert.isDefined(new ModelA());
                var ModelB = SchemaFactory.create(schemaB);
                assert.isDefined(new ModelB());
            });

        });

        describe('toJSON', function() {

            it('should serialize only schema properties', function() {
                var TestModel = SchemaFactory.create({
                    "type": "object",
                    "properties": {
                        "b": {
                            "type": "string"
                        },
                        "c": {
                            "type": "string"
                        }
                    }
                });

                var testModel = new TestModel({
                    a: "A",
                    b: "B",
                    c: "C",
                    d: "D"
                });

                var json = testModel.toJSON();

                assert.isUndefined(json.a);
                assert.isDefined(json.b);
                assert.isDefined(json.c);
                assert.isUndefined(json.d);

            });

            it('should serialize attributes', function() {
                var TestModel = SchemaFactory.create({
                    "type": "object",
                    "properties": {
                        "a": {
                            "type": "string"
                        },
                        "b": {
                            "type": "integers"
                        }
                    }
                });

                var testModel = new TestModel({
                    a: "A",
                    b: 123
                });

                assert.equal(JSON.stringify(testModel.toJSON()), '{"a":"A","b":123}');

            });

            it('should serialize HasOne relations', function() {
                var TestModel = SchemaFactory.create({
                    "id": "/backbone.schema/tests/a",
                    "type": "object",
                    "properties": {
                        "item": {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                });

                var testModel = new TestModel({
                    item: {
                        name: "A"
                    }
                });

                assert.instanceOf(testModel.get('item'), SchemaModel);
                assert.equal(JSON.stringify(testModel.toJSON()), '{"item":{"name":"A"}}');
            });

            it('should serialize HasMany relations', function() {
                var TestModel = SchemaFactory.create({
                    "id": "/backbone.schema/tests/a",
                    "type": "object",
                    "properties": {
                        "collection": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {
                                        "type": "string"
                                    }
                                }
                            }
                        }
                    }
                });

                var testModel = new TestModel({
                    collection: [{
                        name: "A"
                    }, {
                        name: "B"
                    }, {
                        name: "C"
                    }]
                });

                assert.instanceOf(testModel.get('collection'), SchemaCollection);
                assert.equal(JSON.stringify(testModel.toJSON()), '{"collection":[{"name":"A"},{"name":"B"},{"name":"C"}]}');
            });

            it('should serialize HasMany String Value based relations', function() {
                var TestModel = SchemaFactory.create({
                    "id": "/backbone.schema/tests/a",
                    "type": "object",
                    "properties": {
                        "collection": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        }
                    }
                });

                var testModel = new TestModel({
                    collection: ['A', 'B', 'C']
                });

                assert.instanceOf(testModel.get('collection'), SchemaCollection);
                assert.equal(JSON.stringify(testModel.toJSON()), '{"collection":["A","B","C"]}');
            });

            it('should serialize HasMany Integer Value based relations', function() {
                var TestModel = SchemaFactory.create({
                    "id": "/backbone.schema/tests/a",
                    "type": "object",
                    "properties": {
                        "collection": {
                            "type": "array",
                            "items": {
                                "type": "integer"
                            }
                        }
                    }
                });

                var testModel = new TestModel({
                    collection: [1, 2, 3]
                });

                assert.instanceOf(testModel.get('collection'), SchemaCollection);
                assert.equal(JSON.stringify(testModel.toJSON()), '{"collection":[1,2,3]}');
            });

            it('should serialize a circular reference (with ids)', function() {
                var schemaA = {
                    "id": "/backbone.schema/tests/a",
                    "type": "object",
                    "properties": {
                        "id": {
                            "type": "integer"
                        },
                        "b": {
                            "$ref": "/backbone.schema/tests/b#"
                        }
                    }
                };

                var schemaB = {
                    "id": "/backbone.schema/tests/b",
                    "type": "object",
                    "properties": {
                        "id": {
                            "type": "integer"
                        },
                        "a": {
                            "$ref": "/backbone.schema/tests/a#"
                        }
                    }
                };

                register(schemaA);
                register(schemaB);

                var ModelA = SchemaFactory.create(schemaA);
                var ModelB = SchemaFactory.create(schemaB);

                var modelA = new ModelA({
                    id: 1
                });
                var modelB = new ModelB({
                    id: 2
                });

                modelA.set('b', modelB);
                modelB.set('a', modelA);

                assert.equal(JSON.stringify(modelA.toJSON()), '{"id":1,"b":{"id":2,"a":{"id":1}}}');
                assert.equal(JSON.stringify(modelB.toJSON()), '{"id":2,"a":{"id":1,"b":{"id":2}}}');
            });

            it('should serialize model with custom idAttribute', function() {
                var BaseModel = SchemaModel.extend({
                    idAttribute: "custom"
                });

                var TestModel = SchemaFactory.create({
                    "type": "object",
                    "properties": {
                        "custom": {
                            "type": "integer"
                        }
                    }
                }, BaseModel);

                var testModel = new TestModel({
                    "custom": 123
                });
                assert.instanceOf(testModel, BaseModel);
                assert.instanceOf(testModel, TestModel);
                assert.equal(testModel.idAttribute, "custom");
                assert.equal(JSON.stringify(testModel.toJSON()), '{"custom":123}');
            });

            it('should serialize a circular reference (with custom ids)', function() {
                var schemaA = {
                    "id": "/backbone.schema/tests/a",
                    "title": "A",
                    "type": "object",
                    "properties": {
                        "custom": {
                            "type": "integer"
                        },
                        "b": {
                            "$ref": "/backbone.schema/tests/b#"
                        }
                    }
                };

                var schemaB = {
                    "id": "/backbone.schema/tests/b",
                    "title": "B",
                    "type": "object",
                    "properties": {
                        "custom": {
                            "type": "integer"
                        },
                        "a": {
                            "$ref": "/backbone.schema/tests/a#"
                        }
                    }
                };

                var CustomIDModel = SchemaModel.extend({
                    idAttribute: 'custom'
                });

                register(schemaA, CustomIDModel);
                register(schemaB, CustomIDModel);

                var ModelA = SchemaFactory.create("/backbone.schema/tests/a");
                var ModelB = SchemaFactory.create("/backbone.schema/tests/b");

                var modelA = new ModelA({
                    custom: 1
                });
                var modelB = new ModelB({
                    custom: 2
                });

                assert.instanceOf(modelA, Backbone.Model);
                assert.instanceOf(modelA, SchemaModel);
                assert.instanceOf(modelA, CustomIDModel);

                assert.equal(modelA.idAttribute, 'custom');
                assert.equal(modelB.idAttribute, 'custom');

                modelA.set('b', modelB);
                modelB.set('a', modelA);

                assert.equal(JSON.stringify(modelA.toJSON()), '{"custom":1,"b":{"custom":2,"a":{"custom":1}}}');
                assert.equal(JSON.stringify(modelB.toJSON()), '{"custom":2,"a":{"custom":1,"b":{"custom":2}}}');
            });

            it('should serialize a circular reference (without ids)', function() {
                var schemaA = {
                    "id": "/backbone.schema/tests/a",
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string"
                        },
                        "b": {
                            "$ref": "/backbone.schema/tests/b#"
                        }
                    }
                };

                var schemaB = {
                    "id": "/backbone.schema/tests/b",
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string"
                        },
                        "a": {
                            "$ref": "/backbone.schema/tests/a#"
                        }
                    }
                };

                register(schemaA);
                register(schemaB);

                var ModelA = SchemaFactory.create(schemaA);
                var ModelB = SchemaFactory.create(schemaB);

                var modelA = new ModelA({
                    name: "A"
                });
                var modelB = new ModelB({
                    name: "B"
                });

                modelA.set('b', modelB);
                modelB.set('a', modelA);

                assert.equal(JSON.stringify(modelA.toJSON()), '{"name":"A","b":{"name":"B"}}');
                assert.equal(JSON.stringify(modelB.toJSON()), '{"name":"B","a":{"name":"A"}}');
            });

            it('should serialize a circular reference (without ids or other attributes)', function() {
                var schemaA = {
                    "id": "/backbone.schema/tests/a",
                    "type": "object",
                    "properties": {
                        "b": {
                            "$ref": "/backbone.schema/tests/b#"
                        }
                    }
                };

                var schemaB = {
                    "id": "/backbone.schema/tests/b",
                    "type": "object",
                    "properties": {
                        "a": {
                            "$ref": "/backbone.schema/tests/a#"
                        }
                    }
                };

                register(schemaA);
                register(schemaB);

                var ModelA = SchemaFactory.create(schemaA);
                var ModelB = SchemaFactory.create(schemaB);

                var modelA = new ModelA();
                var modelB = new ModelB();

                modelA.set('b', modelB);
                modelB.set('a', modelA);

                assert.equal(JSON.stringify(modelA.toJSON()), undefined);
                assert.equal(JSON.stringify(modelB.toJSON()), undefined);
            });
        });

        describe('Validation', function() {
            describe('minLength', function() {

                beforeEach(function() {
                    tester = new ModelValidationTester("minLength");
                });

                it('should validate when minLength constraint is met', function() {
                    assert.isTrue(tester.isValid("123456"));
                });

                it('should not validate when minLength constraint is not met', function() {
                    assert.isFalse(tester.isValid("1234"));
                });

                it('should return appropriate errors when minLength constraint is not met', function() {
                    assert.isTrue(tester.testModelErrors("1234"));
                });
            });

            describe('maxLength', function() {

                beforeEach(function() {
                    tester = new ModelValidationTester("maxLength");
                });

                it('should validate when maxLength constraint is met', function() {
                    assert.isTrue(tester.isValid("1234"));
                });

                it('should not validate when maxLength constraint is not met', function() {
                    assert.isFalse(tester.isValid("123456"));
                });

                it('should return appropriate errors when maxLength constraint is not met', function() {
                    assert.isTrue(tester.testModelErrors("123456"));
                });
            });

            describe('minimum', function() {

                beforeEach(function() {
                    tester = new ModelValidationTester("minimum");
                });

                it('should validate when minimum constraint is met', function() {
                    assert.isTrue(tester.isValid(6));
                });

                it('should validate when minimum constraint is not met', function() {
                    assert.isFalse(tester.isValid(4));
                });

                it('should return appropriate errors when minimum constraint is not met', function() {
                    assert.isTrue(tester.testModelErrors(4));
                });
            });

            describe('exclusiveMinimum', function() {

                beforeEach(function() {
                    tester = new ModelValidationTester("exclusiveMinimum");
                });

                it('should validate when exclusiveMinimum constraint is met', function() {
                    assert.isTrue(tester.isValid(6));
                });

                it('should validate when exclusiveMinimum constraint is not met', function() {
                    assert.isFalse(tester.isValid(5));
                });

                it('should return appropriate errors when exclusiveMinimum constraint is not met', function() {
                    assert.isTrue(tester.testModelErrors(5, 'minimum'));
                });
            });

            describe('maximum', function() {

                beforeEach(function() {
                    tester = new ModelValidationTester("maximum");
                });

                it('should validate when maximum constraint is met', function() {
                    assert.isTrue(tester.isValid(5));
                });

                it('should not validate when maximum constraint is not met', function() {
                    assert.isFalse(tester.isValid(6));
                });

                it('should return appropriate errors when maximum constraint is not met', function() {
                    assert.isTrue(tester.testModelErrors(6));
                });
            });

            describe('exclusiveMaximum', function() {

                beforeEach(function() {
                    tester = new ModelValidationTester("exclusiveMaximum");
                });

                it('should validate when exclusiveMaximum constraint is met', function() {
                    assert.isTrue(tester.isValid(4));
                });

                it('should not validate when exclusiveMaximum constraint is not met', function() {
                    assert.isFalse(tester.isValid(5));
                });

                it('should return appropriate errors when exclusiveMaximum constraint is not met', function() {
                    assert.isTrue(tester.testModelErrors(5, 'maximum'));
                });
            });

            describe('divisibleBy', function() {

                beforeEach(function() {
                    tester = new ModelValidationTester("divisibleBy");
                });

                it('should validate when divisibleBy constraint is met', function() {
                    assert.isTrue(tester.isValid(0));
                    assert.isTrue(tester.isValid(5));
                    assert.isTrue(tester.isValid(10));
                    assert.isTrue(tester.isValid(15));
                });

                it('should validate when divisibleBy constraint is not met', function() {
                    assert.isFalse(tester.isValid(7));
                });

                it('should return appropriate errors when divisibleBy constraint is not met', function() {
                    assert.isTrue(tester.testModelErrors(13));
                });
            });

            describe('format', function() {
                describe('email', function() {

                    beforeEach(function() {
                        tester = new ModelValidationTester('format$email');
                    });

                    it('should validate when format email constraint is met', function() {
                        assert.isTrue(tester.isValid("a@b.com"));
                    });

                    it('should not validate when format email constraint is not met', function() {
                        assert.isFalse(tester.isValid("ab.com"));
                    });

                    it('should return appropriate errors when format email constraint is not met', function() {
                        assert.isTrue(tester.testModelErrors("ab.com"));
                    });
                });
            });

            describe('pattern', function() {

                beforeEach(function() {
                    tester = new ModelValidationTester("pattern");
                });

                it('should validate when pattern constraint is met', function() {
                    assert.isTrue(tester.isValid("abc"));
                });

                it('should not validate when pattern constraint is not met', function() {
                    assert.isFalse(tester.isValid("a2c"));
                });

                it('should return appropriate errors when pattern constraint is not met', function() {
                    assert.isTrue(tester.testModelErrors("a2c"));
                });
            });
        });
    });

    describe('SchemaCollection', function() {

        describe('Initialization', function() {

            var Companies;
            beforeEach(function() {
                registerSchemas();
                Companies = SchemaFactory.create("/backbone.schema/tests/companies");
            });

            it('should create a schema collection using a registered schema', function() {
                var companies = new Companies();
                assert.instanceOf(companies, SchemaCollection);
                assert.instanceOf(companies, Backbone.Collection);
                assert.isFunction(companies.count);
            });

            it('should initialize a schema collection with items', function() {
                var companies = new Companies([{
                    "name": "Redpie"
                }, {
                    "name": "Pixie"
                }]);
                assert.equal(companies.length, 2);
                assert.instanceOf(companies.at(0), SchemaModel);
                assert.equal(companies.at(0).get('name'), "Redpie");
                assert.instanceOf(companies.at(1), SchemaModel);
                assert.equal(companies.at(1).get('name'), "Pixie");
            });

            it('should reset a schema collection with items', function() {
                var companies = new Companies();
                companies.reset([{
                    "name": "Redpie"
                }, {
                    "name": "Pixie"
                }]);
                assert.equal(companies.length, 2);
                assert.instanceOf(companies.at(0), SchemaModel);
                assert.equal(companies.at(0).get('name'), "Redpie");
                assert.instanceOf(companies.at(1), SchemaModel);
                assert.equal(companies.at(1).get('name'), "Pixie");
            });

            it('should add an uninitialized schema model to a collection', function() {
                var Company = SchemaFactory.create("/backbone.schema/tests/company");

                var companies = new Companies();
                assert.equal(companies.length, 0);
                companies.add({
                    "name": "Redpie"
                });
                assert.equal(companies.length, 1);
                assert.instanceOf(companies.at(0), SchemaModel);
                assert.instanceOf(companies.at(0), Company);
                assert.equal(companies.at(0).get('name'), "Redpie");
            });

            it('should add an initialized schema model to a collection', function() {
                var Company = SchemaFactory.create("/backbone.schema/tests/company");

                var companies = new Companies();
                assert.equal(companies.length, 0);

                companies.add(new Company({
                    "name": "Redpie"
                }));
                assert.equal(companies.length, 1);
                assert.instanceOf(companies.at(0), SchemaModel);
                assert.instanceOf(companies.at(0), Company);
                assert.equal(companies.at(0).get('name'), "Redpie");
            });

        });

        describe('Validation', function() {

            describe('minItems', function() {

                beforeEach(function() {
                    tester = new ModelValidationTester("minItems");
                });

                it('should validate when minItems constraint is met', function() {
                    var collection = tester.model.get('minItems');
                    collection.add([new SchemaModel(), new SchemaModel()]);
                    assert.isTrue(tester.isValid(undefined, {
                        deep: true
                    }));
                });

                it('should not validate when minItems constraint is not met', function() {
                    var collection = tester.model.get('minItems');
                    collection.add([new SchemaModel()]);
                    assert.isFalse(tester.isValid(undefined, {
                        deep: true
                    }));
                });

                it('should return appropriate errors when minItems constraint is not met', function() {
                    var collection = tester.model.get('minItems');
                    collection.add([new SchemaModel()]);
                    assert.isTrue(tester.testCollectionErrors(undefined, {
                        deep: true
                    }));
                });
            });

            describe('maxItems', function() {

                beforeEach(function() {
                    tester = new ModelValidationTester("maxItems");
                });

                it('should validate when maxItems constraint is met', function() {
                    var collection = tester.model.get('maxItems');
                    collection.add([new SchemaModel(), new SchemaModel()]);
                    assert.isTrue(tester.isValid(undefined, {
                        deep: true
                    }));
                });

                it('should not validate when maxItems constraint is not met', function() {
                    var collection = tester.model.get('maxItems');
                    collection.add([new SchemaModel(), new SchemaModel(), new SchemaModel()]);
                    assert.isFalse(tester.isValid(undefined, {
                        deep: true
                    }));
                });

                it('should return appropriate errors when maxItems constraint is not met', function() {
                    var collection = tester.model.get('maxItems');
                    collection.add([new SchemaModel(), new SchemaModel(), new SchemaModel()]);
                    assert.isTrue(tester.testCollectionErrors(undefined, {
                        deep: true
                    }));
                });
            });
        });
    });

    describe('SchemaValueCollection', function() {

        describe('Direct Instantiation - integers', function() {

            var collection;
            beforeEach(function() {
                collection = new SchemaValueCollection([1, 2, 3]);
            });

            afterEach(function() {
                collection.dispose();
            });

            it('should initialize the collection from an array of integers', function() {
                assert.equal(collection.length, 3);
            });

            it('should return an integer from at method', function() {
                assert.equal(collection.at(0), 1);
                assert.equal(collection.at(1), 2);
                assert.equal(collection.at(2), 3);
            });

        });

        describe('Direct Instantiation - strings', function() {

            var collection;
            beforeEach(function() {
                collection = new SchemaValueCollection(['one', 'two', 'three']);
            });

            afterEach(function() {
                collection.dispose();
            });

            it('should initialize the collection from an array of strings', function() {
                assert.equal(collection.length, 3);
            });

            it('should return a string from at method', function() {
                assert.equal(collection.at(0), 'one');
                assert.equal(collection.at(1), 'two');
                assert.equal(collection.at(2), 'three');
            });

        });

        describe('Relational Instantiation from Schema defined Models', function() {

            var model;
            beforeEach(function() {
                var Model = SchemaFactory.create({
                    'type': 'object',
                    'properties': {
                        'integers': {
                            'type': 'array',
                            'items': {
                                'type': 'integer'
                            }
                        },
                        'strings': {
                            'type': 'array',
                            'items': {
                                'type': 'string'
                            }
                        }
                    }
                });

                model = new Model({
                    'integers': [1, 2, 3],
                    'strings': ['one', 'two', 'three']
                });
            });

            afterEach(function() {
                model.dispose();
            });

            it('should initialize the related collections with values', function() {
                assert.equal(model.get('strings').length, 3);
                assert.equal(model.get('integers').length, 3);
            });

            it('should return a value from the "at" method', function() {

                assert.equal(model.get('strings').at(0), 'one');
                assert.equal(model.get('strings').at(1), 'two');
                assert.equal(model.get('strings').at(2), 'three');

                assert.equal(model.get('integers').at(0), 1);
                assert.equal(model.get('integers').at(1), 2);
                assert.equal(model.get('integers').at(2), 3);
            });

        });

        describe('Validation', function() {

            describe('minItems', function() {

                beforeEach(function() {
                    tester = new ModelValidationTester("minItems");
                });

                it('should validate when minItems constraint is met', function() {
                    var collection = tester.model.get('minItems');
                    collection.add([1, 2]);
                    assert.isTrue(tester.isValid(undefined, {
                        deep: true
                    }));
                });

                it('should not validate when minItems constraint is not met', function() {
                    var collection = tester.model.get('minItems');
                    collection.add(1);
                    assert.isFalse(tester.isValid(undefined, {
                        deep: true
                    }));
                });

                it('should return appropriate errors when minItems constraint is not met', function() {
                    var collection = tester.model.get('minItems');
                    collection.add(1);
                    assert.isTrue(tester.testCollectionErrors(undefined, {
                        deep: true
                    }));
                });
            });

            describe('maxItems', function() {

                beforeEach(function() {
                    tester = new ModelValidationTester("maxItems");
                });

                it('should validate when maxItems constraint is met', function() {
                    var collection = tester.model.get('maxItems');
                    collection.add([1, 2]);
                    assert.isTrue(tester.isValid(undefined, {
                        deep: true
                    }));
                });

                it('should not validate when maxItems constraint is not met', function() {
                    var collection = tester.model.get('maxItems');
                    collection.add([1, 2, 3]);
                    assert.isFalse(tester.isValid(undefined, {
                        deep: true
                    }));
                });

                it('should return appropriate errors when maxItems constraint is not met', function() {
                    var collection = tester.model.get('maxItems');
                    collection.add([1, 2, 3]);
                    assert.isTrue(tester.testCollectionErrors(undefined, {
                        deep: true
                    }));
                });
            });
        });

    });

    describe('__Internals__', function() {

        describe('JSONPointer', function() {
            var JSONPointer = SchemaTestHelper.JSONPointer;

            var obj = {
                "foo": ["bar", "baz"],
                "": 0,
                "a/b": 1,
                "c%d": 2,
                "e^f": 3,
                "g|h": 4,
                "i\\j": 5,
                "k\"l": 6,
                " ": 7,
                "m~n": 8
            };

            var tester;
            beforeEach(function() {
                tester = new JSONPointer(obj);
            });

            describe('get', function() {
                it('whole document', function() {
                    assert.strictEqual(tester.get(''), obj);
                });

                it('/foo', function() {
                    assert.deepEqual(tester.get('/foo'), ['bar', 'baz']);
                });

                it('/foo/0', function() {
                    assert.strictEqual(tester.get('/foo/0'), 'bar');
                });

                it('/', function() {
                    assert.strictEqual(tester.get('/'), 0);
                });

                it('/a~1b', function() {
                    assert.strictEqual(tester.get('/a~1b'), 1);
                });

                it('/c%d', function() {
                    assert.strictEqual(tester.get('/c%d'), 2);
                });

                it('/e^f', function() {
                    assert.strictEqual(tester.get('/e^f'), 3);
                });

                it('/g|h', function() {
                    assert.strictEqual(tester.get('/g|h'), 4);
                });

                it('/i\\j', function() {
                    assert.strictEqual(tester.get('/i\\j'), 5);
                });

                it('/k\"l', function() {
                    assert.strictEqual(tester.get('/k\"l'), 6);
                });

                it('/ ', function() {
                    assert.strictEqual(tester.get('/ '), 7);
                });

                it('/m~0n', function() {
                    assert.strictEqual(tester.get('/m~0n'), 8);
                });
            });

            describe('set', function() {

                var setObj = {
                    test: 'a'
                };

                it('whole document', function() {
                    tester.set('/', setObj);
                    assert.strictEqual(tester.get('/'), setObj);
                });

                it('/foo', function() {
                    tester.set('/foo', setObj);
                    assert.deepEqual(tester.get('/foo'), setObj);
                });

                it('/foo/0', function() {
                    tester.set('/foo/0', setObj);
                    assert.strictEqual(tester.get('/foo/0'), setObj);
                });

                it('/', function() {
                    tester.set('/', setObj);
                    assert.strictEqual(tester.get('/'), setObj);
                });

                it('/a~1b', function() {
                    tester.set('/a~1b', setObj);
                    assert.strictEqual(tester.get('/a~1b'), setObj);
                });

                it('/c%d', function() {
                    tester.set('/c%d', setObj);
                    assert.strictEqual(tester.get('/c%d'), setObj);
                });

                it('/e^f', function() {
                    tester.set('/e^f', setObj);
                    assert.strictEqual(tester.get('/e^f'), setObj);
                });

                it('/g|h', function() {
                    tester.set('/g|h', setObj);
                    assert.strictEqual(tester.get('/g|h'), setObj);
                });

                it('/i\\j', function() {
                    tester.set('/i\\j', setObj);
                    assert.strictEqual(tester.get('/i\\j'), setObj);
                });

                it('/k\"l', function() {
                    tester.set('/k\"l', setObj);
                    assert.strictEqual(tester.get('/k\"l'), setObj);
                });

                it('/ ', function() {
                    tester.set('/ ', setObj);
                    assert.strictEqual(tester.get('/ '), setObj);
                });

                it('/m~0n', function() {
                    tester.set('/m~0n', setObj);
                    assert.strictEqual(tester.get('/m~0n'), setObj);
                });
            });
        });

        describe('Parse Schema', function() {

            describe('References', function() {

                it('"$ref": "#"', function() {
                    schema = {
                        "id": "/backbone.schema/tests/test",
                        "type": "object",
                        "properties": {
                            "self": {
                                "$ref": "#"
                            }
                        }
                    };
                    var parsed = parse(schema);

                    assert.strictEqual(parsed.properties.self, parsed);
                });

                it('"$ref": "schemaid#"', function() {
                    var referenced = parse({
                        "id": "/backbone.schema/tests/referenced",
                        "type": "object"
                    });

                    var parsed = parse({
                        "id": "/backbone.schema/tests/test",
                        "type": "object",
                        "properties": {
                            "referenced": {
                                "$ref": "/backbone.schema/tests/referenced#"
                            }
                        }
                    });

                    assert.strictEqual(parsed.properties.referenced, referenced);
                });

                it('"$ref": "#fragment" (referenced appears before $ref in same schema)', function() {
                    var parsed = parse({
                        "id": "/backbone.schema/tests/test",
                        "type": "object",
                        "properties": {
                            "referenced": {
                                "type": "object"
                            },
                            "reference": {
                                "$ref": "#/properties/referenced"
                            }
                        }
                    });

                    assert.strictEqual(parsed.properties.reference, parsed.properties.referenced);
                });

                it('"$ref": "#fragment" (referenced appears after $ref in same schema)', function() {
                    var parsed = parse({
                        "id": "/backbone.schema/tests/test",
                        "type": "object",
                        "properties": {
                            "reference": {
                                "$ref": "#/properties/referenced"
                            },
                            "referenced": {
                                "type": "object"
                            }
                        }
                    });

                    assert.strictEqual(parsed.properties.reference, parsed.properties.referenced);
                });

                it('"$ref": "schemaid#fragment"', function() {
                    var referenced = parse({
                        "id": "/backbone.schema/tests/referenced",
                        "type": "object",
                        "properties": {
                            "referenced": {
                                "type": "object"
                            }
                        }
                    });

                    var parsed = parse({
                        "id": "/backbone.schema/tests/test",
                        "type": "object",
                        "properties": {
                            "reference": {
                                "$ref": "/backbone.schema/tests/referenced#/properties/referenced"
                            }
                        }
                    });

                    assert.strictEqual(parsed.properties.reference, referenced.properties.referenced);
                });

                it('Circular "$ref": "schemaid#"', function() {

                    var schemaA = {
                        "id": "/backbone.schema/tests/a",
                        "type": "object",
                        "properties": {
                            "b": {
                                "$ref": "/backbone.schema/tests/b#"
                            }
                        }
                    };

                    var schemaB = {
                        "id": "/backbone.schema/tests/b",
                        "type": "object",
                        "properties": {
                            "a": {
                                "$ref": "/backbone.schema/tests/a#"
                            }
                        }
                    };

                    register(schemaA);
                    register(schemaB);

                    var a = SchemaFactory.parse(schemaA, schemaA);
                    var b = SchemaFactory.parse(schemaB, schemaB);

                    assert.strictEqual(a.properties.b, b);
                    assert.strictEqual(b.properties.a, a);
                });

                it('Circular "$ref": "schemaid#fragment"', function() {

                    var schemaA = {
                        "id": "/backbone.schema/tests/a",
                        "type": "object",
                        "properties": {
                            "aa": {
                                "$ref": "/backbone.schema/tests/b#/properties/bb"
                            }
                        }
                    };

                    var schemaB = {
                        "id": "/backbone.schema/tests/b",
                        "type": "object",
                        "properties": {
                            "bb": {
                                "$ref": "/backbone.schema/tests/b#/properties/aa"
                            }
                        }
                    };

                    register(schemaA);
                    register(schemaB);

                    var a = SchemaFactory.parse(schemaA);
                    var b = SchemaFactory.parse(schemaB);

                    assert.strictEqual(a.properties.aa, b.properties.bb);
                    assert.strictEqual(b.properties.bb, a.properties.aa);

                });

                it('Circular "$ref": "schemaid#fragment (nested)"', function() {

                    var schemaA = {
                        "id": "/backbone.schema/tests/a",
                        "type": "object",
                        "properties": {
                            "aa": {
                                "type": "object",
                                "properties": {
                                    "aaa": {
                                        "$ref": "/backbone.schema/tests/b#/properties/bb"
                                    }
                                }
                            }
                        }
                    };

                    var schemaB = {
                        "id": "/backbone.schema/tests/b",
                        "type": "object",
                        "properties": {
                            "bb": {
                                "type": "object",
                                "properties": {
                                    "bbb": {
                                        "$ref": "/backbone.schema/tests/a#/properties/aa"
                                    }
                                }
                            }
                        }
                    };

                    register(schemaA);
                    register(schemaB);

                    var a = SchemaFactory.parse(schemaA);
                    var b = SchemaFactory.parse(schemaB);

                    assert.strictEqual(a.properties.aa.properties.aaa, b.properties.bb);
                    assert.strictEqual(b.properties.bb.properties.bbb, a.properties.aa);

                });
            });

        });

        describe('Validators', function() {

            describe('Required', function() {

                it('should return true when required is true value is provided', function() {
                    assert.isTrue(SchemaTestHelper.Validators.required('test', true));
                });

                it('should return false when required is true value is not provided', function() {
                    assert.isFalse(SchemaTestHelper.Validators.required(undefined, true));
                });

                it('should return true when required is false value is provided', function() {
                    assert.isTrue(SchemaTestHelper.Validators.required('test', true));
                });

                it('should return true when required is false value is not provided', function() {
                    assert.isFalse(SchemaTestHelper.Validators.required(undefined, false));
                });
            });

            describe('MinLength', function() {

                it('should return true when value length > minLength', function() {
                    assert.isTrue(SchemaTestHelper.Validators.minLength('test', 3));
                });

                it('should return true when value length = minLength', function() {
                    assert.isTrue(SchemaTestHelper.Validators.minLength('test', 4));
                });

                it('should return false when value length < minLength', function() {
                    assert.isFalse(SchemaTestHelper.Validators.minLength('test', 5));
                });

                it('should return true when value is provided and minLength = 0', function() {
                    assert.isTrue(SchemaTestHelper.Validators.minLength('test', 0));
                });

                it('should return false when value is not provided and minLength = 0', function() {
                    assert.isFalse(SchemaTestHelper.Validators.minLength(undefined, 0));
                });

            });

            describe('MaxLength', function() {

                it('should return false when value length > maxLength', function() {
                    assert.isFalse(SchemaTestHelper.Validators.maxLength('test', 3));
                });

                it('should return true when value length = maxLength', function() {
                    assert.isTrue(SchemaTestHelper.Validators.maxLength('test', 4));
                });

                it('should return true when value length < maxLength', function() {
                    assert.isTrue(SchemaTestHelper.Validators.maxLength('test', 5));
                });

                it('should return false when value is provided and maxLength = 0', function() {
                    assert.isFalse(SchemaTestHelper.Validators.maxLength('test', 0));
                });

                it('should return true when value is not provided and maxLength = 0', function() {
                    assert.isTrue(SchemaTestHelper.Validators.maxLength(undefined, 0));
                });

            });

            describe('Minimum', function() {

                it('should return true when value > minimum', function() {
                    assert.isTrue(SchemaTestHelper.Validators.minimum(4, 3));
                });

                it('should return true when value = minimum', function() {
                    assert.isTrue(SchemaTestHelper.Validators.minimum(3, 3));
                });

                it('should return false when value < minimum', function() {
                    assert.isFalse(SchemaTestHelper.Validators.minimum(2, 3));
                });

                it('should return false when value is not a number', function() {
                    assert.isFalse(SchemaTestHelper.Validators.minimum('test', 3));
                });

                it('should return true when value is provided and the minimum = 0', function() {
                    assert.isTrue(SchemaTestHelper.Validators.minimum(4, 0));
                });

            });

            describe('Maximum', function() {

                it('should return true when value < maximum', function() {
                    assert.isTrue(SchemaTestHelper.Validators.maximum(2, 3));
                });

                it('should return true when value = maximum', function() {
                    assert.isTrue(SchemaTestHelper.Validators.maximum(3, 3));
                });

                it('should return false when value > maximum', function() {
                    assert.isFalse(SchemaTestHelper.Validators.maximum(4, 3));
                });

                it('should return false when value is not a number', function() {
                    assert.isFalse(SchemaTestHelper.Validators.maximum('test', 3));
                });

                it('should return false when value is provided and the maximum = 0', function() {
                    assert.isFalse(SchemaTestHelper.Validators.maximum(4, 0));
                });

            });

            describe('DivisibleBy', function() {

                it('should return true when value % divisibleBy === 0', function() {
                    assert.isTrue(SchemaTestHelper.Validators.divisibleBy(10, 5));
                });

                it('should return true when value = divisibleBy', function() {
                    assert.isTrue(SchemaTestHelper.Validators.divisibleBy(5, 5));
                });

                it('should return false when value < divisibleBy', function() {
                    assert.isFalse(SchemaTestHelper.Validators.divisibleBy(5, 10));
                });

                it('should return false when value is not a number', function() {
                    assert.isFalse(SchemaTestHelper.Validators.divisibleBy('test', 5));
                });

                it('should return false when divisibleBy is 0', function() {
                    assert.isFalse(SchemaTestHelper.Validators.divisibleBy(4, 0));
                });

            });

            describe('Format', function() {

                describe('date-time', function() {

                    it.skip('should return true when value is valid date-time', function() {
                        // From http://www.pelagodesign.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/
                        _.each(['2009-12T12:34', '2009', '2009-05-19', '2009-05-19', '20090519', '2009123', '2009-05', '2009-123', '2009-222', '2009-001', '2009-W01-1', '2009-W51-1', '2009-W511', '2009-W33', '2009W511', '2009-05-19', '2009-05-19 00:00', '2009-05-19 14', '2009-05-19 14:31', '2009-05-19 14:39:22', '2009-05-19T14:39Z', '2009-W21-2', '2009-W21-2T01:22', '2009-139', '2009-05-19 14:39:22-06:00', '2009-05-19 14:39:22+0600', '2009-05-19 14:39:22-01', '20090621T0545Z', '2007-04-06T00:00', '2007-04-05T24:00', '2010-02-18T16:23:48.5', '2010-02-18T16:23:48,444', '2010-02-18T16:23:48,3-06:00', '2010-02-18T16:23.4', '2010-02-18T16:23,25', '2010-02-18T16:23.33+0600', '2010-02-18T16.23334444', '2010-02-18T16,2283', '2009-05-19 143922.500', '2009-05-19 1439,55'], function(date){
                            assert.isTrue(SchemaTestHelper.Validators.format(date, 'date-time'));
                        });

                    });

                    it.skip('should return false when value is invalid date-time', function() {
                        _.each(['200905', '2009367', '2009-', '2007-04-05T24:50', '2009-000', '2009-M511', '2009M511', '2009-05-19T14a39r', '2009-05-19T14:3924', '2009-0519', '2009-05-1914:39', '2009-05-19 14:', '2009-05-19r14:39', '2009-05-19 14a39a22', '200912-01', '2009-05-19 14:39:22+06a00', '2009-05-19 146922.500', '2010-02-18T16.5:23.35:48', '2010-02-18T16:23.35:48', '2010-02-18T16:23.35:48.45', '2009-05-19 14.5.44', '2010-02-18T16:23.33.600', '2010-02-18T16,25:23:48,444'], function(date) {
                            assert.isFalse(SchemaTestHelper.Validators.format(date, 'date-time'), date);
                        });
                    });

                });

                describe('color', function() {

                    it('should return true when value is valid color', function() {
                        _.each(['#000000', '#FF0000', '#FFFFFF', 'red', 'green', 'bisque'], function(color){
                            assert.isTrue(SchemaTestHelper.Validators.format(color, 'color'), color);
                        });

                    });

                    it('should return false when value is invalid color', function() {
                        _.each(['#F00', '#12345', '000', '123456', 'newyork'], function(color) {
                            assert.isFalse(SchemaTestHelper.Validators.format(color, 'color'), color);
                        });
                    });

                });

                describe('uri', function() {

                    it('should return true when value is valid uri', function() {
                        _.each(['http://jargon.io','http://pix.ie','https://www.bt.co.uk:80'], function(uri){
                            assert.isTrue(SchemaTestHelper.Validators.format(uri, 'uri'), uri);
                        });

                    });

                    it('should return false when value is invalid uri', function() {
                        _.each(['www.tcd.ie','https://', '//redpie.com'], function(uri) {
                            assert.isFalse(SchemaTestHelper.Validators.format(uri, 'uri'), uri);
                        });
                    });

                });

                describe('email', function() {

                    it('should return true when value is valid email', function() {
                        assert.isTrue(SchemaTestHelper.Validators.format('a@test.com', 'email'));
                    });

                    it('should return false when value is invalid email', function() {
                        assert.isFalse(SchemaTestHelper.Validators.format('@test.com', 'email'));
                    });

                    it('should return false when value is invalid email', function() {
                        assert.isFalse(SchemaTestHelper.Validators.format('a@test.', 'email'));
                    });

                    it('should return false when value is invalid email', function() {
                        assert.isFalse(SchemaTestHelper.Validators.format('a@test', 'email'));
                    });

                    it('should return true when value is valid email with + addressing', function() {
                        assert.isTrue(SchemaTestHelper.Validators.format('a+b@test.com', 'email'));
                    });

                });
            });

            describe('Pattern', function() {

                it('should return true when value matches the supplied pattern', function() {
                    assert.isTrue(SchemaTestHelper.Validators.pattern('abc123def', '[a-z]+[0-9]+[a-z]+'));
                });

                it('should return false when value does not match the supplied pattern', function() {
                    assert.isFalse(SchemaTestHelper.Validators.pattern('abcdef', '[a-z]+[0-9]+[a-z]+'));
                });

            });

            describe('MinItems', function() {

                it('should return true when number of items exceeds minimum', function() {
                    assert.isTrue(SchemaTestHelper.Validators.minItems([1, 2, 3], 2));
                });

                it('should return true when number of items is equal to minimum', function() {
                    assert.isTrue(SchemaTestHelper.Validators.minItems([1, 2], 2));
                });

                it('should return false when number of items is less than minimum', function() {
                    assert.isFalse(SchemaTestHelper.Validators.minItems([1], 2));
                });

            });

            describe('MaxItems', function() {

                it('should return true when number of items is less than maximum', function() {
                    assert.isTrue(SchemaTestHelper.Validators.maxItems([1], 2));
                });

                it('should return true when number of items is equal to maximum', function() {
                    assert.isTrue(SchemaTestHelper.Validators.maxItems([1, 2], 2));
                });

                it('should return false when number of items exceeds maximum', function() {
                    assert.isFalse(SchemaTestHelper.Validators.maxItems([1, 2, 3], 2));
                });

            });

            describe('UniqueItems', function() {

                it('should return true when items [Array] are unique', function() {
                    assert.isTrue(SchemaTestHelper.Validators.uniqueItems([1, 2, 3]));
                });

                it('should return false when items [Array] are not unique', function() {
                    assert.isFalse(SchemaTestHelper.Validators.uniqueItems([1, 2, 1]));
                });

            });
        });
    });
});
