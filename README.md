NOTE
====
This is a patched and npm-published version of https://github.com/redpie/backbone-schema

Backbone.Schema
===============

[![Build Status](https://secure.travis-ci.org/redpie/backbone-schema.png?branch=master)](https://travis-ci.org/redpie/backbone-schema)

Backbone.Schema allows developers to specify rich [Backbone](https://github.com/documentcloud/backbone) models and collections with [JSON-Schema](http://json-schema.org).

## Features

* Create rich Backbone models and collections directly from JSON Schema
* Complex schemas are automatically converted to nested models and collections facilitating:
    - One to One Relations
    - One to Many Relations
* Lazy initialization of nested models and collections
* Supports "value" based collections (i.e. array of strings, integers, booleans etc)
* Automatic validation of models and collections using schema validation properties
* Gracefully handles circular references for both:
    - Type Creation
    - Instance Serialization
* Allows pre-registration of default model and collection base classes to be used for specific schemas or schema fragments
* Internal caching ensures we never create the same models or collections types twice
* Identity map for models
* Supports the majority of the [JSON-Schema specification](http://tools.ietf.org/html/draft-zyp-json-schema-03) including:
    - Validation
    - References via JSON-Pointers
    - Inheritance via "extends" (Draft 03 of the JSON-Schema spec regarding "extends" is currently ambiguous and is due to be superseded by "anyOf" in draft 04 leaving "extends" open to further ambiguity).

## Usage and Examples

### Backbone.Schema.Factory

The Backbone.Schema.Factory class provides methods to register schemas and create new models and collections directly from schema.

The class should only be instantiated once per application:

```javascript
var factory = new Backbone.Schema.Factory();
```

You can pass application specific configuration in the options parameter:

```javascript
var factory = new Backbone.Schema.Factory({
    // My application's custom base model class
    model: Backbone.Schema.Model.extend({ ... }),

    // My application's custom base model class
    collection: Backbone.Schema.Collection.extend({ ... })
});
```

### Creating Model and Collection Types

Use Backbone.Schema.Factory to create new model and collection types.

```javascript
var factory = new Backbone.Schema.Factory();

var PersonModel = factory.create({
   "id": "/schemas/person",
   "type": "object",
   "properties": {
        "name": {
            "type": "string"
        },
        "surname": {
            "type": "string"
        }
    }
});

var person = new PersonModel({
    "name": "Marcus",
    "surname": "Mac Innes"
});
```

As well as being able to provide Backbone.Schema.Factory with default base model
and collection classes, you can also specify schema specific base classes.

The only requirement is that model base classes extend Backbone.Schema.Model and
collection base classes extend Backbone.Schema.Collection.

```javascript
var factory = new Backbone.Schema.Factory();

var PersonModelBase = Backbone.Schema.Model.extend({
    fullname: function() {
        return this.get('name') + ' ' + this.get('surname');
    }
});

var PersonModel = factory.create({
   "id": "/schemas/person",
   "type": "object",
   "properties": {
        "name": {
            "type": "string"
        },
        "surname": {
            "type": "string"
        }
    }
}, PersonModelBase);

var person = new Person({
    "name": "Marcus",
    "surname": "Mac Innes"
});

var fullname = person.fullname(); // should be "Marcus Mac Innes"
```

***Note**: There is a requirement that model base classes extend
Backbone.Schema.Model and collection base classes extend
Backbone.Schema.Collection.*

### Pre-Registering Schemas

Schemas can be pre-registered which is a handy way of telling Backbone.Schema
to store them for future use.

```javascript
var factory = new Backbone.Schema.Factory();

factory.register({
   "id": "/schemas/person",
   "type": "object",
   "properties": {
        "name": {
            "type": "string"
        },
        "surname": {
            "type": "string"
        }
    }
});
```

This method is useful if you want to register all your application schemas
when your application starts. Since this only caches schemas and does
no real work, it returns quickly and doesn't delay your application
from starting quickly.

This is also useful if your schema contains references to other schemas.
For schemas that reference other schemas, referenced schemas must have
been previously either registered or created. More on this below...

Similar to create, register allows you to specify a base class for the schema.

```javascript
var factory = new Backbone.Schema.Factory();

var PersonModelBase = Backbone.Schema.Model.extend({
    fullname: function() {
        return this.get('name') + ' ' + this.get('surname');
    }
});

factory.register({
   "id": "/schemas/person",
   "type": "object",
   "properties": {
        "name": {
            "type": "string"
        },
        "surname": {
            "type": "string"
        }
    }
}, PersonModelBase);
```

Once a schema has been registered, you can create types using only the
schema id, rather than having to specify the entire schema again:

```javascript
var factory = new Backbone.Schema.Factory();

factory.register({
   "id": "/schemas/person",
   "type": "object",
   "properties": {
        "name": {
            "type": "string"
        },
        "surname": {
            "type": "string"
        }
    }
});

// Create a Model using the pre-registered schema whose id is "/schemas/person"
var PersonModel = factory.create("/schemas/person");

var person = new PersonModel({
    "name": "Marcus",
    "surname": "Mac Innes"
});
```

### Backbone.Schema.Factory Type Caching
If the schema has an id (recommended), the newly create type will be cached and
re-used whenever that schema id is encountered again (schema ids must be
unique).

```javascript
var factory = new Backbone.Schema.Factory();

var PersonModel1 = factory.create({
   "id": "/schemas/person",
   "type": "object",
   "properties": {
        "name": {
            "type": "string"
        },
        "surname": {
            "type": "string"
        }
    }
});

var PersonModel2 = factory.create({
   "id": "/schemas/person",
   "type": "object",
   "properties": {
        "name": {
            "type": "string"
        },
        "surname": {
            "type": "string"
        }
    }
});

// PersonModel1 === PersonModel2
```

### Creating Instances Directly

You can create instantiated models and collections directly if you don't
need to keep a reference to the type.

```javascript
var factory = new Backbone.Schema.Factory();

var person = factory.createInstance({
   "id": "/schemas/person",
   "type": "object",
   "properties": {
        "name": {
            "type": "string"
        },
        "surname": {
            "type": "string"
        }
    }
}, {
    // Model attributes
    "name": "Marcus",
    "surname": "Mac Innes"
}, {
    // Model options
});
```

Like the create() method, createInstance() also allows you to specify just the schema id if it has already been registered or created previously.

### Relations, Nested Models and Collections

JSON Schemas can contains child objects and arrays which are automatically
converted to nested models and collections during the create process.

Nested models and collections can be initialized just like regular attributes in the Model or Collection constructor.

#### One to One Relations

```javascript
var factory = new Backbone.Schema.Factory();

var PersonModel = factory.create({
   "id": "/schemas/person",
   "type": "object",
   "properties": {
        "name": {
            "type": "string"
        },
        "surname": {
            "type": "string"
        },
        // Creates an EmployerSchemaModel type under the covers
        "employer": {
            "type": "object",
            "properties": {
                "name": { "type": "string" }
            }
        }
    }
});

var person = new PersonModel({
    "name": "Marcus",
    "surname": "Mac Innes",
    "employer": {
        "name": "Redpie"
    }
});

var employerName = person.get('employer').get('name'); // should be "Redpie"
```

#### One to Many Relations

```javascript
var factory = new Backbone.Schema.Factory();

var PersonModel = factory.create({
   "id": "/schemas/person",
   "type": "object",
   "properties": {
        "name": {
            "type": "string"
        },
        "surname": {
            "type": "string"
        },
        "employers": {
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

var person = new PersonModel({
    "name": "Marcus",
    "surname": "Mac Innes",
    "employers": [
        { "name": "Redpie" },
        { "name": "Jargon" }
    ]
});

var firstEmployerName = person.get('employers').at(0).get('name'); // should be "Redpie"
```

#### Lazy Initialization

Empty nested models and collections are lazy initialized,
in other words they are not initialized until they are accessed which
enhances performance and helps minimize memory consumption.

```javascript
var factory = new Backbone.Schema.Factory();

var PersonModel = factory.create({
   "id": "/schemas/person",
   "type": "object",
   "properties": {
        "name": {
            "type": "string"
        },
        "surname": {
            "type": "string"
        },
        "address": {
            "type": "object",
            "properties": {
                "addressline1": {
                    "type": "string"
                },
                "addressline2": {
                    "type": "string"
                },
                "city": {
                    "type": "string"
                },
                "country": {
                    "type": "string"
                }
            }
        },
        "phoneNumbers": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "number": {
                        "type": "string"
                    },
                    "areaCode": {
                        "type": "string"
                    },
                    "countryCode": {
                        "type": "string"
                    }
                }
            }
        }
    }
});

// Create person but don't provide any attribute data yet
var person = new PersonModel();

// the address attribute starts off undefined
var isAddressUndefined = person.attributes['address'] === undefined; // true
// returns a new AddressSchemaModel
person.get('address');
// You can now see the address attribute is initialized
isAddressUndefined = person.attributes['address'] === undefined; // false

// Same for collections:
var isPhoneNumbersUndefined = person.attributes['phoneNumbers'] === undefined; // true
person.get('phoneNumbers');
isPhoneNumbersUndefined = person.attributes['phoneNumbers'] === undefined; // false
```

### Value Based Collections

The native Backbone.Collection only supports collections of models and
cannot currently be used to represent a collection of value types such as strings, numbers or booleans.

To overcome this limitation we introduced Backbone.Schema.ValueCollection (which extends Backbone.Schema.Collection) to allow you to create collections like:

```
var collection = new Backbone.Schema.ValueCollection(['zero', one', 'two', 'three']);
var two = collection.at(2); // Should be "two"
```

This addition is important as JSON Schemas often contain arrays of value types. See "tags" in example below:

```javascript
var factory = new Backbone.Schema.Factory();

var PhotoModel = factory.create({
    "id": "/schemas/photo",
    "type": "object",
    "properties": {
        "title": {
            "type": "string"
        },
        "url": {
            "type": "string"
        },
        "tags": {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    }
});

var photo = new PhotoModel({
    "title": "A Photo Of Me & Zak",
    "url": "http://pix.ie/marcus/2924495",
    "tags": ["marcus", "zak", "paris"]
});

var tag3 = photo.get('tags').at(2); // Should be "paris"
```

SchemaValueCollections behave exactly the same way as collections with a few exceptions.
The following collection methods are not supported:

* pluck
* getByCid

### Creating Models from Schemas that Contain "Self References"

A self-reference is where the schema contains, you guessed it, a reference to itself.
In JSON Schema this takes the form:

```javascript
{
    "$ref": "#"
}
```

In the example below, the property "spouse" is referencing the person schema and so
person.get('spouse') will return another instance of PersonModel for spouse.

```javascript
var factory = new Backbone.Schema.Factory();

var PersonModel = factory.create({
   "id": "/schemas/person",
   "type": "object",
   "properties": {
        "name": {
            "type": "string"
        },
        "surname": {
            "type": "string"
        },
        "spouse": {
            "$ref": "#" // references the schema root i.e. "/schemas/person#"
        }
    }
});

var person = new PersonModel({
    "name": "Marcus",
    "surname": "Mac Innes",
    "spouse": {
        "name": "Kadija",
        "surname": "Duiri"
    }
});

var spouseName = person.get('spouse').get('name'); // should be "Kadija"
```

### Creating Models from Schemas that References Other Schemas

It is usual break schemas down into small units which can be reused.

```javascript
var factory = new Backbone.Schema.Factory();

// Register a Phone Number
factory.register({
    "id": "/schemas/phonenumber",
    "type": "object",
    "properties": {
        "number": {
            "type": "string"
        },
        "areaCode": {
            "type": "string"
        },
        "countryCode": {
            "type": "string"
        }
    }
});

// Register an Address
factory.register({
    "id": "/schemas/address",
    "type": "object",
    "properties": {
        "addressline1": {
            "type": "string"
        },
        "addressline2": {
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

// Register a Person
factory.register({
   "id": "/schemas/person",
   "type": "object",
   "properties": {
        "id": {
            "type": "integer"
        },
        "name": {
            "type": "string"
        },
        "surname": {
            "type": "string"
        },
        "address": {
            "$ref": "/schemas/address#"
        },
        "phoneNumbers": {
            "type": "array",
            "items": {
                "$ref": "/schemas/phonenumber#"
            }
        },
        "employer": {
            "$ref": "/schemas/company#"
        }
    }
});

// Register a Company
factory.register({
   "id": "/schemas/company",
   "type": "object",
   "properties": {
        "id": {
            "type": "integer"
        },
        "name": {
            "type": "string"
        },
        "address": {
            "$ref": "/schemas/address#"
        },
        "phoneNumbers": {
            "type": "array",
            "items": {
                "$ref": "/schemas/phonenumber#"
            }
        },
        "employees": {
            "type": "array",
            "items": {
                "$ref": "/schemas/person#"
            }
        }
    }
});

var PersonModel = factory.create("/schemas/person#");
var CompanyModel = factory.create("/schemas/company#");
```

Notice the circular references in the schema, person contains an "employer" of type company and company contains "employees" of type person. No problem!

### toJSON

We can now use the models we just defined above to create instances as follows:

```javascript
var person = new PersonModel({
    "id": 1234,
    "name": "Marcus"
});

var company = new CompanyModel({
    "id": 5678,
    "name": "Redpie"
});

person.set('employer', company);

// NOTE: We don't automatically add back references, you must add them yourself if they are required.
company.get('employees').add(person);

console.log(JSON.stringify(person.toJSON());
// Prints:
// {
//     "id": 1234,
//     "name": "Marcus",
//     "employer": {
//         "name": "Redpie",
//         "employees": [
//             { "id": 1234 }
//         ]
//     }
// }

```

The circular reference in the data didn't cause the toJSON method any issues either.
When a circular reference is encountered during the toJSON processing, the second
instance of the model simply outputs it's id property or is skipped if no id is defined.

Another interesting feature of toJSON is that it only outputs attributes
that have been defined in the schema. All other attributes are ignored.

```javascript
var factory = new Backbone.Schema.Factory();

var PersonModel = factory.create({
   "id": "/schemas/person",
   "type": "object",
   "properties": {
        "name": {
            "type": "string"
        },
        "surname": {
            "type": "string"
        }
    }
});

var person = new PersonModel({
    "name": "Marcus",
    "surname": "Mac Innes",
    "favoriteColor": "green"
});

console.log(JSON.stringify(person.toJSON()));
//  Prints only the attributes defined by the schema:
//  {
//      "name": "Marcus",
//      "surname": "Mac Innes"
//  }
```

This is usefull if you want to add view data to your models without having that data saved back to the server.

## Project Status

Version 0.1

Backbone.Schema is currently being developed as part of a larger project. We should have tests covering all the major features, but more are needed.

## License

Backbone.Schema is licensed under MIT ([http://www.opensource.org/licenses/MIT](http://www.opensource.org/licenses/MIT))

## Copyright

Copyright (c) 2012, Marcus Mac Innes, Redpie
