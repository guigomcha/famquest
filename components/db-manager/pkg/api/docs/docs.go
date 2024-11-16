// Package docs Code generated by swaggo/swag. DO NOT EDIT
package docs

import "github.com/swaggo/swag"

const docTemplate = `{
    "schemes": {{ marshal .Schemes }},
    "swagger": "2.0",
    "info": {
        "description": "{{escape .Description}}",
        "title": "{{.Title}}",
        "termsOfService": "http://swagger.io/terms/",
        "contact": {
            "name": "Guillermo Gomez",
            "url": "https://github.com/guigomcha/famquest/",
            "email": "guillermo.gc1994@gmail.com"
        },
        "license": {
            "name": "Guillermo Gomez GPL V3"
        },
        "version": "{{.Version}}"
    },
    "host": "{{.Host}}",
    "basePath": "{{.BasePath}}",
    "paths": {
        "/attachment": {
            "get": {
                "description": "Get a list of all attachments",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "attachment"
                ],
                "summary": "Retrieve all attachments",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Reference ID (optional)",
                        "name": "refId",
                        "in": "query"
                    },
                    {
                        "enum": [
                            "spot",
                            "task"
                        ],
                        "type": "string",
                        "description": "Reference Type (optional)",
                        "name": "refType",
                        "in": "query"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/definitions/models.Attachments"
                            }
                        }
                    }
                }
            },
            "post": {
                "description": "Create a new attachment",
                "consumes": [
                    "multipart/form-data"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "attachment"
                ],
                "summary": "Create a attachment",
                "parameters": [
                    {
                        "type": "file",
                        "description": "image/* or media/*",
                        "name": "file",
                        "in": "formData",
                        "required": true
                    },
                    {
                        "type": "string",
                        "description": "name of the attachment",
                        "name": "name",
                        "in": "formData",
                        "required": true
                    },
                    {
                        "type": "string",
                        "description": "description of the attachment",
                        "name": "description",
                        "in": "formData",
                        "required": true
                    }
                ],
                "responses": {
                    "201": {
                        "description": "Created",
                        "schema": {
                            "$ref": "#/definitions/models.Attachments"
                        }
                    }
                }
            }
        },
        "/attachment/{id}": {
            "get": {
                "description": "Get attachment details by ID",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "attachment"
                ],
                "summary": "Retrieve a attachment by ID",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Attachment ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/models.Attachments"
                        }
                    }
                }
            },
            "put": {
                "description": "Update attachment details by ID",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "attachment"
                ],
                "summary": "Update a attachment by ID",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Attachment ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    },
                    {
                        "description": "Attachment data",
                        "name": "attachment",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/models.APIAttachments"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/models.Attachments"
                        }
                    }
                }
            },
            "delete": {
                "description": "Delete a attachment and nullify its references in spots",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "attachment"
                ],
                "summary": "Delete a attachment by ID",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Attachment ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    }
                ],
                "responses": {
                    "204": {
                        "description": "No Content",
                        "schema": {
                            "type": "string"
                        }
                    }
                }
            }
        },
        "/attachment/{id}/ref": {
            "put": {
                "description": "Update the ref in a attachment details by ID",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "attachment"
                ],
                "summary": "Update the ref",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Attachment ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    },
                    {
                        "type": "integer",
                        "description": "Reference ID (optional)",
                        "name": "refId",
                        "in": "query",
                        "required": true
                    },
                    {
                        "enum": [
                            "spot",
                            "task",
                            "attachment"
                        ],
                        "type": "string",
                        "description": "Reference Type",
                        "name": "refType",
                        "in": "query",
                        "required": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/models.Attachments"
                        }
                    }
                }
            }
        },
        "/health": {
            "get": {
                "description": "Check the health of the service",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "health"
                ],
                "summary": "Health check",
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "type": "object",
                            "additionalProperties": true
                        }
                    }
                }
            }
        },
        "/location": {
            "get": {
                "description": "Get a list of all locations",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "location"
                ],
                "summary": "Retrieve all locations",
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/definitions/models.KnownLocations"
                            }
                        }
                    }
                }
            },
            "post": {
                "description": "Create a new location",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "location"
                ],
                "summary": "Create a location",
                "parameters": [
                    {
                        "description": "Location data",
                        "name": "location",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/models.APIKnownLocations"
                        }
                    }
                ],
                "responses": {
                    "201": {
                        "description": "Created",
                        "schema": {
                            "$ref": "#/definitions/models.KnownLocations"
                        }
                    }
                }
            }
        },
        "/location/{id}": {
            "get": {
                "description": "Get location details by ID",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "location"
                ],
                "summary": "Retrieve a location by ID",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Location ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/models.KnownLocations"
                        }
                    }
                }
            },
            "put": {
                "description": "Update location details by ID",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "location"
                ],
                "summary": "Update a location by ID",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Location ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    },
                    {
                        "description": "Location data",
                        "name": "location",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/models.APIKnownLocations"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/models.KnownLocations"
                        }
                    }
                }
            },
            "delete": {
                "description": "Delete a location and nullify its references in spots",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "location"
                ],
                "summary": "Delete a location by ID",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Location ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    }
                ],
                "responses": {
                    "204": {
                        "description": "No Content",
                        "schema": {
                            "type": "string"
                        }
                    }
                }
            }
        },
        "/location/{id}/ref": {
            "put": {
                "description": "Update the ref in a location details by ID",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "location"
                ],
                "summary": "Update the ref",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Location ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    },
                    {
                        "type": "integer",
                        "description": "Reference ID (optional)",
                        "name": "refId",
                        "in": "query",
                        "required": true
                    },
                    {
                        "enum": [
                            "spot"
                        ],
                        "type": "string",
                        "description": "Reference Type",
                        "name": "refType",
                        "in": "query",
                        "required": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/models.KnownLocations"
                        }
                    }
                }
            }
        },
        "/spot": {
            "get": {
                "description": "Get a list of all spots",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "spot"
                ],
                "summary": "Retrieve all spots",
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/definitions/models.Spots"
                            }
                        }
                    }
                }
            },
            "post": {
                "description": "Create a new spot",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "spot"
                ],
                "summary": "Create a spot",
                "parameters": [
                    {
                        "description": "Spot data",
                        "name": "spot",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/models.APISpots"
                        }
                    }
                ],
                "responses": {
                    "201": {
                        "description": "Created",
                        "schema": {
                            "$ref": "#/definitions/models.Spots"
                        }
                    }
                }
            }
        },
        "/spot/{id}": {
            "get": {
                "description": "Get spot details by ID",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "spot"
                ],
                "summary": "Retrieve a spot by ID",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Spot ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/models.Spots"
                        }
                    }
                }
            },
            "put": {
                "description": "Update spot details by ID",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "spot"
                ],
                "summary": "Update a spot by ID",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Spot ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    },
                    {
                        "description": "Spot data",
                        "name": "spot",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/models.APISpots"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/models.Spots"
                        }
                    }
                }
            },
            "delete": {
                "description": "Delete a spot and nullify its references in spots",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "spot"
                ],
                "summary": "Delete a spot by ID",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Spot ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    }
                ],
                "responses": {
                    "204": {
                        "description": "No Content",
                        "schema": {
                            "type": "string"
                        }
                    }
                }
            }
        },
        "/task": {
            "get": {
                "description": "Get a list of all tasks",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "task"
                ],
                "summary": "Retrieve all tasks",
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/definitions/models.Tasks"
                            }
                        }
                    }
                }
            },
            "post": {
                "description": "Create a new task",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "task"
                ],
                "summary": "Create a task",
                "parameters": [
                    {
                        "description": "Task data",
                        "name": "task",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/models.APITasks"
                        }
                    }
                ],
                "responses": {
                    "201": {
                        "description": "Created",
                        "schema": {
                            "$ref": "#/definitions/models.Tasks"
                        }
                    }
                }
            }
        },
        "/task/{id}": {
            "get": {
                "description": "Get task details by ID",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "task"
                ],
                "summary": "Retrieve a task by ID",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Task ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/models.Tasks"
                        }
                    }
                }
            },
            "put": {
                "description": "Update task details by ID",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "task"
                ],
                "summary": "Update a task by ID",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Task ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    },
                    {
                        "description": "Task data",
                        "name": "task",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/models.APITasks"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/models.Tasks"
                        }
                    }
                }
            },
            "delete": {
                "description": "Delete a task and nullify its references in spots",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "task"
                ],
                "summary": "Delete a task by ID",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Task ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    }
                ],
                "responses": {
                    "204": {
                        "description": "No Content",
                        "schema": {
                            "type": "string"
                        }
                    }
                }
            }
        },
        "/task/{id}/ref": {
            "put": {
                "description": "Update the ref in a task details by ID",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "task"
                ],
                "summary": "Update the ref",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Task ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    },
                    {
                        "type": "integer",
                        "description": "Reference ID (optional)",
                        "name": "ref",
                        "in": "query",
                        "required": true
                    },
                    {
                        "enum": [
                            "spot"
                        ],
                        "type": "string",
                        "description": "Reference Type",
                        "name": "refType",
                        "in": "query",
                        "required": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/models.Tasks"
                        }
                    }
                }
            }
        }
    },
    "definitions": {
        "models.APIAttachments": {
            "type": "object",
            "properties": {
                "description": {
                    "description": "Description",
                    "type": "string"
                },
                "name": {
                    "type": "string"
                }
            }
        },
        "models.APIKnownLocations": {
            "type": "object",
            "properties": {
                "latitude": {
                    "description": "Latitude as signed float",
                    "type": "number"
                },
                "longitude": {
                    "description": "Longitude as signed float",
                    "type": "number"
                },
                "name": {
                    "type": "string"
                }
            }
        },
        "models.APISpots": {
            "type": "object",
            "properties": {
                "description": {
                    "type": "string"
                },
                "name": {
                    "type": "string"
                }
            }
        },
        "models.APITasks": {
            "type": "object",
            "properties": {
                "description": {
                    "description": "Description",
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "url": {
                    "description": "Url",
                    "type": "string"
                }
            }
        },
        "models.Attachments": {
            "type": "object",
            "properties": {
                "contentType": {
                    "type": "string"
                },
                "createdAt": {
                    "description": "Automatically generated",
                    "type": "string"
                },
                "description": {
                    "type": "string"
                },
                "id": {
                    "description": "DB + JSON",
                    "type": "integer"
                },
                "name": {
                    "type": "string"
                },
                "updatedAt": {
                    "description": "Automatically managed by trigger",
                    "type": "string"
                },
                "url": {
                    "type": "string"
                }
            }
        },
        "models.KnownLocations": {
            "type": "object",
            "properties": {
                "createdAt": {
                    "description": "Automatically generated",
                    "type": "string"
                },
                "id": {
                    "description": "Db + json",
                    "type": "integer"
                },
                "latitude": {
                    "description": "Latitude as signed float",
                    "type": "number"
                },
                "longitude": {
                    "description": "Longitude as signed float",
                    "type": "number"
                },
                "name": {
                    "type": "string"
                },
                "updatedAt": {
                    "description": "Automatically managed by trigger",
                    "type": "string"
                }
            }
        },
        "models.Spots": {
            "type": "object",
            "properties": {
                "attachments": {
                    "type": "array",
                    "items": {
                        "type": "integer"
                    }
                },
                "createdAt": {
                    "description": "Automatically generated",
                    "type": "string"
                },
                "description": {
                    "type": "string"
                },
                "id": {
                    "description": "db + json",
                    "type": "integer"
                },
                "location": {
                    "description": "only json -\u003e Need to create the parse the json  to and from db",
                    "type": "integer"
                },
                "name": {
                    "type": "string"
                },
                "tasks": {
                    "type": "array",
                    "items": {
                        "type": "integer"
                    }
                },
                "updatedAt": {
                    "description": "Automatically managed by trigger",
                    "type": "string"
                }
            }
        },
        "models.Tasks": {
            "type": "object",
            "properties": {
                "createdAt": {
                    "description": "Automatically generated",
                    "type": "string"
                },
                "description": {
                    "type": "string"
                },
                "id": {
                    "description": "Db + Json",
                    "type": "integer"
                },
                "name": {
                    "type": "string"
                },
                "updatedAt": {
                    "description": "Automatically managed by trigger",
                    "type": "string"
                }
            }
        }
    }
}`

// SwaggerInfo holds exported Swagger Info so clients can modify it
var SwaggerInfo = &swag.Spec{
	Version:          "1.0",
	Host:             "",
	BasePath:         "",
	Schemes:          []string{},
	Title:            "FamQuest DB Manager API",
	Description:      "Handles the connection to the DBs in DB Manager. PostgreSQL and MINIO",
	InfoInstanceName: "swagger",
	SwaggerTemplate:  docTemplate,
	LeftDelim:        "{{",
	RightDelim:       "}}",
}

func init() {
	swag.Register(SwaggerInfo.InstanceName(), SwaggerInfo)
}
