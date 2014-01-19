Item = Lich.collapseDataConstructor({
    _lichType: DATA,
    _datatype: "Item",
    _argNames: ["name", "farDescription", "description", "carryable", "action", "curse"]
}, {
    name: "Not an item.",
    farDescription: "Not an item",
    description: "Not an Item.",
    carryable: true,
    action: Lich.VM.Nothing,
    curse: Lich.VM.Nothing
});
Trap = Lich.collapseDataConstructor({
    _lichType: DATA,
    _datatype: "Trap",
    _argNames: ["name", "description", "attack", "dementia"]
}, {
    name: "Acid Trap",
    description: "A jet of acid suddenly shoots from the ground under you. You are burned.",
    attack: 20,
    dementia: 5
});
Location = Lich.collapseDataConstructor({
    _lichType: DATA,
    _datatype: "Location",
    _argNames: ["name", "north", "south", "east", "west", "up", "down", "description", "farDescription", "items", "moveable"]
}, {
    name: "Nowhere",
    north: "Nowhere",
    south: "Nowhere",
    east: "Nowhere",
    west: "Nowhere",
    up: "Nowhere",
    down: "Nowhere",
    description: "Nothing to see here.",
    farDescription: "Nothing to see in the distance.",
    items: Lich.newDictionary.curry([]),
    moveable: false
});
Player = Lich.collapseDataConstructor({
    _lichType: DATA,
    _datatype: "Player",
    _argNames: ["name", "health", "location", "description", "items", "sanity"]
}, {
    name: "New Player",
    health: 100,
    location: "Nowhere",
    description: "A rather academic looking researcher. Cold, but healthy.",
    items: Lich.newDictionary.curry([]),
    sanity: 100
});
Monster = Lich.collapseDataConstructor({
    _lichType: DATA,
    _datatype: "Monster",
    _argNames: ["name", "health", "location", "description", "items", "attack", "dementia"]
}, {
    name: "Nobody",
    health: 100,
    location: "Nowhere",
    description: "Not actually a monster.",
    items: Lich.newDictionary.curry([]),
    attack: 25,
    dementia: 25
});
Game = Lich.collapseDataConstructor({
    _lichType: DATA,
    _datatype: "Game",
    _argNames: ["players", "monsters", "locations", "narration", "gameOver"]
}, {
    players: Lich.newDictionary.curry([
        ["Nobody", (function (_ret) {
            Lich.newData(Player, [], _ret)
        })]
    ]),
    monsters: Lich.newDictionary.curry([
        ["Nobody", (function (_ret) {
            Lich.newData(Monster, [], _ret)
        })]
    ]),
    locations: Lich.newDictionary.curry([
        ["Nowhere", (function (_ret) {
            Lich.newData(Location, [], _ret)
        })]
    ]),
    narration: "",
    gameOver: false
});
North = {
    _lichType: DATA,
    _argNames: [],
    _datatype: "North"
};
South = {
    _lichType: DATA,
    _argNames: [],
    _datatype: "South"
};
East = {
    _lichType: DATA,
    _argNames: [],
    _datatype: "East"
};
West = {
    _lichType: DATA,
    _argNames: [],
    _datatype: "West"
};
Up = {
    _lichType: DATA,
    _argNames: [],
    _datatype: "Up"
};
Down = {
    _lichType: DATA,
    _argNames: [],
    _datatype: "Down"
};
Cardinal = {
    North: North,
    South: South,
    East: East,
    West: West,
    Up: Up,
    Down: Down,
    _lichType: DATA,
    _argNames: [North, South, East, West, Up, Down],
    _datatype: "Cardinal"
};;
north = (function (_ret) {
    Lich.newData(North, [], _ret)
});
Lich.collapse(north, function (_res) {
    north = _res;
});;
south = (function (_ret) {
    Lich.newData(South, [], _ret)
});
Lich.collapse(south, function (_res) {
    south = _res;
});;
east = (function (_ret) {
    Lich.newData(East, [], _ret)
});
Lich.collapse(east, function (_res) {
    east = _res;
});;
west = (function (_ret) {
    Lich.newData(West, [], _ret)
});
Lich.collapse(west, function (_res) {
    west = _res;
});;
up = (function (_ret) {
    Lich.newData(Up, [], _ret)
});
Lich.collapse(up, function (_res) {
    up = _res;
});;
down = (function (_ret) {
    Lich.newData(Down, [], _ret)
});
Lich.collapse(down, function (_res) {
    down = _res;
});;
addNarration = function addNarration(story, game, _ret) {
    (function (_argRet) {
        Lich.collapse(story, function (storyRes) {
            story = storyRes;
            Lich.collapse(game, function (gameRes) {
                game = gameRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse((function (_ret) {
            Lich.dataUpdate(game, [{
                id: "narration",
                exp: Lich.application.curry(Lich.VM.reserved["+"], [(function (_lookRet) {
                    Lich.collapse(game, function (_lookRes) {
                        _lookRet(_lookRes["narration"])
                    })
                }), Lich.application.curry(Lich.VM.reserved["+"], [" ", story])])
            }], _ret)
        }), _ret)
    })
};;
addFarDescriptionToNarration = function addFarDescriptionToNarration(item, game, _ret) {
    (function (_argRet) {
        Lich.collapse(item, function (itemRes) {
            item = itemRes;
            Lich.collapse(game, function (gameRes) {
                game = gameRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse((function (_ret) {
            Lich.dataUpdate(game, [{
                id: "narration",
                exp: Lich.application.curry(Lich.VM.reserved["+"], [(function (_lookRet) {
                    Lich.collapse(game, function (_lookRes) {
                        _lookRet(_lookRes["narration"])
                    })
                }), Lich.application.curry(Lich.VM.reserved["+"], [" ", (function (_lookRet) {
                    Lich.collapse(item, function (_lookRes) {
                        _lookRet(_lookRes["farDescription"])
                    })
                })])])
            }], _ret)
        }), _ret)
    })
};;
foldOverCardinals = function foldOverCardinals(f, loc, _ret) {
    (function (_argRet) {
        Lich.collapse(f, function (fRes) {
            f = fRes;
            Lich.collapse(loc, function (locRes) {
                loc = locRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse((function (_lookRet) {
            Lich.collapse(Lich.functionCompositionWrapper([(function (_lookRet) {
                Lich.collapse(Lich.functionCompositionWrapper([(function (_lookRet) {
                    Lich.collapse(Lich.functionCompositionWrapper([(function (_lookRet) {
                        Lich.collapse(Lich.functionCompositionWrapper([(function (_lookRet) {
                            Lich.collapse(Lich.functionCompositionWrapper([(function (_lookRet) {
                                Lich.collapse(Lich.application.curry(f, [loc]), function (_lookRes) {
                                    _lookRet(_lookRes["north"])
                                })
                            }), Lich.application.curry(f, [loc])]), function (_lookRes) {
                                _lookRet(_lookRes["south"])
                            })
                        }), Lich.application.curry(f, [loc])]), function (_lookRes) {
                            _lookRet(_lookRes["east"])
                        })
                    }), Lich.application.curry(f, [loc])]), function (_lookRes) {
                        _lookRet(_lookRes["west"])
                    })
                }), Lich.application.curry(f, [loc])]), function (_lookRes) {
                    _lookRet(_lookRes["up"])
                })
            }), Lich.application.curry(f, [loc])]), function (_lookRes) {
                _lookRet(_lookRes["down"])
            })
        }), _ret)
    })
};;
addLocationNarration = function addLocationNarration(location, game, _ret) {
    (function (_argRet) {
        Lich.collapse(location, function (locationRes) {
            location = locationRes;
            Lich.collapse(game, function (gameRes) {
                game = gameRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var locationNarratedGame = Lich.application.curry(addNarration, [(function (_lookRet) {
                Lich.collapse(location, function (_lookRes) {
                    _lookRet(_lookRes["description"])
                })
            }), game]);
            var itemNarratedGame = Lich.application.curry(foldr, [addFarDescriptionToNarration, locationNarratedGame, (function (_lookRet) {
                Lich.collapse(location, function (_lookRes) {
                    _lookRet(_lookRes["items"])
                })
            })]);
            return itemNarratedGame
        })()), _ret)
    })
};;
placeItemAtLocation = function placeItemAtLocation(item, location, _ret) {
    (function (_argRet) {
        Lich.collapse(item, function (itemRes) {
            item = itemRes;
            Lich.collapse(location, function (locationRes) {
                location = locationRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var newItems = Lich.application.curry(Lich.VM.reserved[":"], [Lich.newDictionary.curry([
                [(function (_lookRet) {
                    Lich.collapse(item, function (_lookRes) {
                        _lookRet(_lookRes["name"])
                    })
                }), item]
            ]), (function (_lookRet) {
                Lich.collapse(location, function (_lookRes) {
                    _lookRet(_lookRes["items"])
                })
            })]);
            return (function (_ret) {
                Lich.dataUpdate(location, [{
                    id: "items",
                    exp: newItems
                }], _ret)
            })
        })()), _ret)
    })
};;
removeItemFromLocation = function removeItemFromLocation(item, location, _ret) {
    (function (_argRet) {
        Lich.collapse(item, function (itemRes) {
            item = itemRes;
            Lich.collapse(location, function (locationRes) {
                location = locationRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var newItems = Lich.application.curry(remove, [(function (_lookRet) {
                Lich.collapse(item, function (_lookRes) {
                    _lookRet(_lookRes["name"])
                })
            }), (function (_lookRet) {
                Lich.collapse(location, function (_lookRes) {
                    _lookRet(_lookRes["items"])
                })
            })]);
            return (function (_ret) {
                Lich.dataUpdate(location, [{
                    id: "items",
                    exp: newItems
                }], _ret)
            })
        })()), _ret)
    })
};;
giveItemToPlayer = function giveItemToPlayer(item, player, _ret) {
    (function (_argRet) {
        Lich.collapse(item, function (itemRes) {
            item = itemRes;
            Lich.collapse(player, function (playerRes) {
                player = playerRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var newItems = Lich.application.curry(Lich.VM.reserved[":"], [Lich.newDictionary.curry([
                [(function (_lookRet) {
                    Lich.collapse(item, function (_lookRes) {
                        _lookRet(_lookRes["name"])
                    })
                }), item]
            ]), (function (_lookRet) {
                Lich.collapse(player, function (_lookRes) {
                    _lookRet(_lookRes["items"])
                })
            })]);
            return (function (_ret) {
                Lich.dataUpdate(player, [{
                    id: "items",
                    exp: newItems
                }], _ret)
            })
        })()), _ret)
    })
};;
removeItemFromPlayer = function removeItemFromPlayer(item, player, _ret) {
    (function (_argRet) {
        Lich.collapse(item, function (itemRes) {
            item = itemRes;
            Lich.collapse(player, function (playerRes) {
                player = playerRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var newItems = Lich.application.curry(remove, [(function (_lookRet) {
                Lich.collapse(item, function (_lookRes) {
                    _lookRet(_lookRes["name"])
                })
            }), (function (_lookRet) {
                Lich.collapse(player, function (_lookRes) {
                    _lookRet(_lookRes["items"])
                })
            })]);
            return (function (_ret) {
                Lich.dataUpdate(player, [{
                    id: "items",
                    exp: newItems
                }], _ret)
            })
        })()), _ret)
    })
};;
updateLocation = function updateLocation(location, game, _ret) {
    (function (_argRet) {
        Lich.collapse(location, function (locationRes) {
            location = locationRes;
            Lich.collapse(game, function (gameRes) {
                game = gameRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var newLocations = Lich.application.curry(Lich.VM.reserved[":"], [Lich.newDictionary.curry([
                [(function (_lookRet) {
                    Lich.collapse(location, function (_lookRes) {
                        _lookRet(_lookRes["name"])
                    })
                }), location]
            ]), (function (_lookRet) {
                Lich.collapse(game, function (_lookRes) {
                    _lookRet(_lookRes["locations"])
                })
            })]);
            return (function (_ret) {
                Lich.dataUpdate(game, [{
                    id: "locations",
                    exp: newLocations
                }], _ret)
            })
        })()), _ret)
    })
};;
addLocations = function addLocations(newLocations, game, _ret) {
    (function (_argRet) {
        Lich.collapse(newLocations, function (newLocationsRes) {
            newLocations = newLocationsRes;
            Lich.collapse(game, function (gameRes) {
                game = gameRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var combinedLocations = Lich.application.curry(Lich.VM.reserved[":"], [(function (_lookRet) {
                Lich.collapse(game, function (_lookRes) {
                    _lookRet(_lookRes["locations"])
                })
            }), newLocations]);
            return (function (_ret) {
                Lich.dataUpdate(game, [{
                    id: "locations",
                    exp: combinedLocations
                }], _ret)
            })
        })()), _ret)
    })
};;
getLocation = function getLocation(locationName, game, _ret) {
    (function (_argRet) {
        Lich.collapse(locationName, function (locationNameRes) {
            locationName = locationNameRes;
            Lich.collapse(game, function (gameRes) {
                game = gameRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(Lich.application.curry(Lich.VM.reserved["!!"], [(function (_lookRet) {
            Lich.collapse(game, function (_lookRes) {
                _lookRet(_lookRes["locations"])
            })
        }), locationName]), _ret)
    })
};;
getPlayer = function getPlayer(playerName, game, _ret) {
    (function (_argRet) {
        Lich.collapse(playerName, function (playerNameRes) {
            playerName = playerNameRes;
            Lich.collapse(game, function (gameRes) {
                game = gameRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(Lich.application.curry(Lich.VM.reserved["!!"], [(function (_lookRet) {
            Lich.collapse(game, function (_lookRes) {
                _lookRet(_lookRes["players"])
            })
        }), playerName]), _ret)
    })
};;
getMonster = function getMonster(monsterName, game, _ret) {
    (function (_argRet) {
        Lich.collapse(monsterName, function (monsterNameRes) {
            monsterName = monsterNameRes;
            Lich.collapse(game, function (gameRes) {
                game = gameRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(Lich.application.curry(Lich.VM.reserved["!!"], [(function (_lookRet) {
            Lich.collapse(game, function (_lookRes) {
                _lookRet(_lookRes["monsters"])
            })
        }), monsterName]), _ret)
    })
};;
findSomethingWithName = function findSomethingWithName(name, game, _ret) {
    (function (_argRet) {
        Lich.collapse(name, function (nameRes) {
            name = nameRes;
            Lich.collapse(game, function (gameRes) {
                game = gameRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var player = Lich.application.curry(getPlayer, [name, game]);
            var monster = Lich.application.curry(getMonster, [name, game]);
            var location = Lich.application.curry(getLocation, [name, game]);
            return Lich.application.curry(Lich.VM.reserved["?"], [player, Lich.application.curry(Lich.VM.reserved["?"], [monster, location])])
        })()), _ret)
    })
};;
updatePlayer = function updatePlayer(player, game, _ret) {
    (function (_argRet) {
        Lich.collapse(player, function (playerRes) {
            player = playerRes;
            Lich.collapse(game, function (gameRes) {
                game = gameRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var newPlayers = Lich.application.curry(Lich.VM.reserved[":"], [Lich.newDictionary.curry([
                [(function (_lookRet) {
                    Lich.collapse(player, function (_lookRes) {
                        _lookRet(_lookRes["name"])
                    })
                }), player]
            ]), (function (_lookRet) {
                Lich.collapse(game, function (_lookRes) {
                    _lookRet(_lookRes["players"])
                })
            })]);
            return (function (_ret) {
                Lich.dataUpdate(game, [{
                    id: "players",
                    exp: newPlayers
                }], _ret)
            })
        })()), _ret)
    })
};;
updateMonster = function updateMonster(monster, game, _ret) {
    (function (_argRet) {
        Lich.collapse(monster, function (monsterRes) {
            monster = monsterRes;
            Lich.collapse(game, function (gameRes) {
                game = gameRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var newMonsters = Lich.application.curry(Lich.VM.reserved[":"], [Lich.newDictionary.curry([
                [(function (_lookRet) {
                    Lich.collapse(monster, function (_lookRes) {
                        _lookRet(_lookRes["name"])
                    })
                }), monster]
            ]), (function (_lookRet) {
                Lich.collapse(game, function (_lookRes) {
                    _lookRet(_lookRes["monsters"])
                })
            })]);
            return (function (_ret) {
                Lich.dataUpdate(game, [{
                    id: "monsters",
                    exp: newMonsters
                }], _ret)
            })
        })()), _ret)
    })
};;
moveItemFromPlayerToLocation = function moveItemFromPlayerToLocation(item, location, player, game, _ret) {
    (function (_argRet) {
        Lich.collapse(item, function (itemRes) {
            item = itemRes;
            Lich.collapse(location, function (locationRes) {
                location = locationRes;
                Lich.collapse(player, function (playerRes) {
                    player = playerRes;
                    Lich.collapse(game, function (gameRes) {
                        game = gameRes;
                    })
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var newLocation = Lich.application.curry(placeItemAtLocation, [item, location]);
            var newPlayer = Lich.application.curry(removeItemFromPlayer, [item, player]);
            var newGame = Lich.application.curry(updateLocation, [newLocation, game]);
            return Lich.application.curry(updatePlayer, [newPlayer, newGame])
        })()), _ret)
    })
};;
pickupCarryableItemFromLocation = function pickupCarryableItemFromLocation(item, location, player, game, _ret) {
    (function (_argRet) {
        Lich.collapse(item, function (itemRes) {
            item = itemRes;
            Lich.collapse(location, function (locationRes) {
                location = locationRes;
                Lich.collapse(player, function (playerRes) {
                    player = playerRes;
                    Lich.collapse(game, function (gameRes) {
                        game = gameRes;
                    })
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var newLocation = Lich.application.curry(removeItemFromLocation, [item, location]);
            var newPlayer = Lich.application.curry(giveItemToPlayer, [item, player]);
            var newGame = Lich.application.curry(updateLocation, [newLocation, game]);
            return Lich.application.curry(updatePlayer, [newPlayer, newGame])
        })()), _ret)
    })
};;
pickupItemFromLocation = function pickupItemFromLocation(item, location, player, game, _ret) {
    (function (_argRet) {
        Lich.collapse(item, function (itemRes) {
            item = itemRes;
            Lich.collapse(location, function (locationRes) {
                location = locationRes;
                Lich.collapse(player, function (playerRes) {
                    player = playerRes;
                    Lich.collapse(game, function (gameRes) {
                        game = gameRes;
                    })
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(function (_ret) {
            Lich.collapse(Lich.application.curry(Lich.VM.reserved["&&"], [Lich.application.curry(Lich.VM.reserved["=="], [(function (_lookRet) {
                Lich.collapse(player, function (_lookRes) {
                    _lookRet(_lookRes["location"])
                })
            }), (function (_lookRet) {
                Lich.collapse(location, function (_lookRes) {
                    _lookRet(_lookRes["name"])
                })
            })]), (function (_lookRet) {
                Lich.collapse(item, function (_lookRes) {
                    _lookRet(_lookRes["carryable"])
                })
            })]), function (_object) {
                var _bool = (function () {
                    if (_object !== true) {
                        return false
                    } else {
                        return true
                    };
                })();
                if (_bool) {
                    return Lich.collapse(Lich.application.curry(pickupCarryableItemFromLocation, [item, location, player, game]), _ret)
                };
                var _bool = (function () {
                    if (_object !== false) {
                        return false
                    } else {
                        return true
                    };
                })();
                if (_bool) {
                    return Lich.collapse(Lich.application.curry(addNarration, [game, "I can't carray that!"]), _ret)
                };
                throw new Error("case statement found no matching patterns.")
            })
        }, _ret)
    })
};;
playerLocation = function playerLocation(player, game, _ret) {
    (function (_argRet) {
        Lich.collapse(player, function (playerRes) {
            player = playerRes;
            Lich.collapse(game, function (gameRes) {
                game = gameRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(Lich.application.curry(Lich.VM.reserved["!!"], [(function (_lookRet) {
            Lich.collapse(game, function (_lookRes) {
                _lookRet(_lookRes["locations"])
            })
        }), (function (_lookRet) {
            Lich.collapse(player, function (_lookRes) {
                _lookRet(_lookRes["location"])
            })
        })]), _ret)
    })
};;
locationAtCardinal = function locationAtCardinal(cardinal, player, game, _ret) {
    (function (_argRet) {
        Lich.collapse(cardinal, function (cardinalRes) {
            cardinal = cardinalRes;
            Lich.collapse(player, function (playerRes) {
                player = playerRes;
                Lich.collapse(game, function (gameRes) {
                    game = gameRes;
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var oldLocation = Lich.application.curry(playerLocation, [player, game]);
            var newLocation = function (_ret) {
                Lich.collapse(cardinal, function (_object) {
                    var _bool = (function () {
                        if (Lich.dataMatch(_object, "North")) {;
                            return true
                        } else {
                            return false
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(getLocation, [(function (_lookRet) {
                            Lich.collapse(oldLocation, function (_lookRes) {
                                _lookRet(_lookRes["north"])
                            })
                        }), game]), _ret)
                    };
                    var _bool = (function () {
                        if (Lich.dataMatch(_object, "South")) {;
                            return true
                        } else {
                            return false
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(getLocation, [(function (_lookRet) {
                            Lich.collapse(oldLocation, function (_lookRes) {
                                _lookRet(_lookRes["south"])
                            })
                        }), game]), _ret)
                    };
                    var _bool = (function () {
                        if (Lich.dataMatch(_object, "East")) {;
                            return true
                        } else {
                            return false
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(getLocation, [(function (_lookRet) {
                            Lich.collapse(oldLocation, function (_lookRes) {
                                _lookRet(_lookRes["east"])
                            })
                        }), game]), _ret)
                    };
                    var _bool = (function () {
                        if (Lich.dataMatch(_object, "West")) {;
                            return true
                        } else {
                            return false
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(getLocation, [(function (_lookRet) {
                            Lich.collapse(oldLocation, function (_lookRes) {
                                _lookRet(_lookRes["west"])
                            })
                        }), game]), _ret)
                    };
                    var _bool = (function () {
                        if (Lich.dataMatch(_object, "Up")) {;
                            return true
                        } else {
                            return false
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(getLocation, [(function (_lookRet) {
                            Lich.collapse(oldLocation, function (_lookRes) {
                                _lookRet(_lookRes["up"])
                            })
                        }), game]), _ret)
                    };
                    var _bool = (function () {
                        if (Lich.dataMatch(_object, "Down")) {;
                            return true
                        } else {
                            return false
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(getLocation, [(function (_lookRet) {
                            Lich.collapse(oldLocation, function (_lookRes) {
                                _lookRet(_lookRes["down"])
                            })
                        }), game]), _ret)
                    };
                    throw new Error("case statement found no matching patterns.")
                })
            };
            return newLocation
        })()), _ret)
    })
};;
lookAtCardinal = function lookAtCardinal(cardinal, player, game, _ret) {
    (function (_argRet) {
        Lich.collapse(cardinal, function (cardinalRes) {
            cardinal = cardinalRes;
            Lich.collapse(player, function (playerRes) {
                player = playerRes;
                Lich.collapse(game, function (gameRes) {
                    game = gameRes;
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var description = (function (_lookRet) {
                Lich.collapse(Lich.application.curry(locationAtCardinal, [cardinal, player, game]), function (_lookRes) {
                    _lookRet(_lookRes["farDescription"])
                })
            });
            return Lich.application.curry(addNarration, [description, game])
        })()), _ret)
    })
};;
movePlayer = function movePlayer(cardinal, player, game, _ret) {
    (function (_argRet) {
        Lich.collapse(cardinal, function (cardinalRes) {
            cardinal = cardinalRes;
            Lich.collapse(player, function (playerRes) {
                player = playerRes;
                Lich.collapse(game, function (gameRes) {
                    game = gameRes;
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var newLocation = Lich.application.curry(locationAtCardinal, [cardinal, player, game]);
            var newLocationName = (function (_lookRet) {
                Lich.collapse(newLocation, function (_lookRes) {
                    _lookRet(_lookRes["name"])
                })
            });
            var newPlayer = (function (_ret) {
                Lich.dataUpdate(player, [{
                    id: "location",
                    exp: newLocationName
                }], _ret)
            });
            var newGame = Lich.application.curry(Lich.application.curry(addLocationNarration, [newLocation]), [Lich.application.curry(updatePlayer, [newPlayer, game])]);
            return function (_ret) {
                Lich.collapse((function (_lookRet) {
                    Lich.collapse(newLocation, function (_lookRes) {
                        _lookRet(_lookRes["moveable"])
                    })
                }), function (_object) {
                    var _bool = (function () {
                        if (_object !== true) {
                            return false
                        } else {
                            return true
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(newGame, _ret)
                    };
                    var _bool = (function () {
                        if (_object !== false) {
                            return false
                        } else {
                            return true
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(addNarration, ["That way is blocked.", game]), _ret)
                    };
                    throw new Error("case statement found no matching patterns.")
                })
            }
        })()), _ret)
    })
};;
moveMonster = function moveMonster(cardinal, monster, game, _ret) {
    (function (_argRet) {
        Lich.collapse(cardinal, function (cardinalRes) {
            cardinal = cardinalRes;
            Lich.collapse(monster, function (monsterRes) {
                monster = monsterRes;
                Lich.collapse(game, function (gameRes) {
                    game = gameRes;
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var newLocation = Lich.application.curry(locationAtCardinal, [cardinal, player, game]);
            var newMonster = (function (_ret) {
                Lich.dataUpdate(monster, [{
                    id: "location",
                    exp: (function (_lookRet) {
                        Lich.collapse(newLocation, function (_lookRes) {
                            _lookRet(_lookRes["name"])
                        })
                    })
                }], _ret)
            });
            return function (_ret) {
                Lich.collapse((function (_lookRet) {
                    Lich.collapse(newLocation, function (_lookRes) {
                        _lookRet(_lookRes["moveable"])
                    })
                }), function (_object) {
                    var _bool = (function () {
                        if (_object !== true) {
                            return false
                        } else {
                            return true
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(updateMonster, [newMonster, game]), _ret)
                    };
                    var _bool = (function () {
                        if (_object !== false) {
                            return false
                        } else {
                            return true
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(addNarration, ["That way is blocked.", game]), _ret)
                    };
                    throw new Error("case statement found no matching patterns.")
                })
            }
        })()), _ret)
    })
};;
movePlayerOrMonster = function movePlayerOrMonster(cardinal, name, game, _ret) {
    (function (_argRet) {
        Lich.collapse(cardinal, function (cardinalRes) {
            cardinal = cardinalRes;
            Lich.collapse(name, function (nameRes) {
                name = nameRes;
                Lich.collapse(game, function (gameRes) {
                    game = gameRes;
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var playerOrMonster = Lich.application.curry(findSomethingWithName, [name, game]);
            var newGame = function (_ret) {
                Lich.collapse(playerOrMonster, function (_object) {
                    var _bool = (function () {
                        if (Lich.dataMatch(_object, "Monster")) {;
                            return true
                        } else {
                            return false
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(moveMonster, [cardinal, playerOrMonster, game]), _ret)
                    };
                    var _bool = (function () {
                        if (Lich.dataMatch(_object, "Player")) {;
                            return true
                        } else {
                            return false
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(movePlayer, [cardinal, playerOrMonster, game]), _ret)
                    };
                    var _bool = (function () {
                        if (Lich.dataMatch(_object, "Location")) {;
                            return true
                        } else {
                            return false
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(game, _ret)
                    };
                    throw new Error("case statement found no matching patterns.")
                })
            };
            return newGame
        })()), _ret)
    })
};;
checkPlayerDeath = function checkPlayerDeath(player, game, _ret) {
    (function (_argRet) {
        Lich.collapse(player, function (playerRes) {
            player = playerRes;
            Lich.collapse(game, function (gameRes) {
                game = gameRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(function (_ret) {
            Lich.collapse(Lich.application.curry(Lich.VM.reserved["<"], [(function (_lookRet) {
                Lich.collapse(player, function (_lookRes) {
                    _lookRet(_lookRes["health"])
                })
            }), 1]), function (_object) {
                var _bool = (function () {
                    if (_object !== true) {
                        return false
                    } else {
                        return true
                    };
                })();
                if (_bool) {
                    return Lich.collapse((function (_ret) {
                        Lich.dataUpdate(Lich.application.curry(addNarration, ["You died.", game]), [{
                            id: "gameOver",
                            exp: true
                        }], _ret)
                    }), _ret)
                };
                var _bool = (function () {
                    if (_object !== false) {
                        return false
                    } else {
                        return true
                    };
                })();
                if (_bool) {
                    return Lich.collapse(game, _ret)
                };
                throw new Error("case statement found no matching patterns.")
            })
        }, _ret)
    })
};;
damagePlayer = function damagePlayer(damage, player, game, _ret) {
    (function (_argRet) {
        Lich.collapse(damage, function (damageRes) {
            damage = damageRes;
            Lich.collapse(player, function (playerRes) {
                player = playerRes;
                Lich.collapse(game, function (gameRes) {
                    game = gameRes;
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var newHealth = Lich.application.curry(Lich.VM.reserved["-"], [(function (_lookRet) {
                Lich.collapse(player, function (_lookRes) {
                    _lookRet(_lookRes["health"])
                })
            }), damage]);
            var damagedPlayer = (function (_ret) {
                Lich.dataUpdate(player, [{
                    id: "health",
                    exp: newHealth
                }], _ret)
            });
            var newGame = Lich.application.curry(updatePlayer, [damagedPlayer, game]);
            return Lich.application.curry(checkPlayerDeath, [damagedPlayer, newGame])
        })()), _ret)
    })
};;
monsterAttacksPlayer = function monsterAttacksPlayer(monster, player, game, _ret) {
    (function (_argRet) {
        Lich.collapse(monster, function (monsterRes) {
            monster = monsterRes;
            Lich.collapse(player, function (playerRes) {
                player = playerRes;
                Lich.collapse(game, function (gameRes) {
                    game = gameRes;
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(Lich.application.curry(damagePlayer, [(function (_lookRet) {
            Lich.collapse(monster, function (_lookRes) {
                _lookRet(_lookRes["attack"])
            })
        }), player, game]), _ret)
    })
};;
updateItemInHolder = function updateItemInHolder(item, itemName, holder, game, _ret) {
    (function (_argRet) {
        Lich.collapse(item, function (itemRes) {
            item = itemRes;
            Lich.collapse(itemName, function (itemNameRes) {
                itemName = itemNameRes;
                Lich.collapse(holder, function (holderRes) {
                    holder = holderRes;
                    Lich.collapse(game, function (gameRes) {
                        game = gameRes;
                    })
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var newHolder = Lich.application.curry(Lich.VM.reserved[":"], [Lich.newDictionary.curry([
                [itemName, item]
            ]), (function (_lookRet) {
                Lich.collapse(holder, function (_lookRes) {
                    _lookRet(_lookRes["items"])
                })
            })]);
            var newGame = function (_ret) {
                Lich.collapse(newHolder, function (_object) {
                    var _bool = (function () {
                        if (Lich.dataMatch(_object, "Monster")) {;
                            return true
                        } else {
                            return false
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(updateMonster, [newHolder, game]), _ret)
                    };
                    var _bool = (function () {
                        if (Lich.dataMatch(_object, "Player")) {;
                            return true
                        } else {
                            return false
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(updatePlayer, [newHolder, game]), _ret)
                    };
                    var _bool = (function () {
                        if (Lich.dataMatch(_object, "Location")) {;
                            return true
                        } else {
                            return false
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(updateLocation, [newHolder, game]), _ret)
                    };
                    throw new Error("case statement found no matching patterns.")
                })
            };
            return newGame
        })()), _ret)
    })
};;
eraseItemInHolder = function eraseItemInHolder(item, holder, game, _ret) {
    (function (_argRet) {
        Lich.collapse(item, function (itemRes) {
            item = itemRes;
            Lich.collapse(holder, function (holderRes) {
                holder = holderRes;
                Lich.collapse(game, function (gameRes) {
                    game = gameRes;
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var newHolder = (function (_ret) {
                Lich.dataUpdate(holder, [{
                    id: "items",
                    exp: Lich.application.curry(remove, [(function (_lookRet) {
                        Lich.collapse(item, function (_lookRes) {
                            _lookRet(_lookRes["name"])
                        })
                    }), (function (_lookRet) {
                        Lich.collapse(holder, function (_lookRes) {
                            _lookRet(_lookRes["items"])
                        })
                    })])
                }], _ret)
            });
            var newGame = function (_ret) {
                Lich.collapse((function (_lookRet) {
                    Lich.collapse(newHolder, function (_lookRes) {
                        _lookRet(_lookRes["dataType"])
                    })
                }), function (_object) {
                    var _bool = (function () {
                        if (Lich.dataMatch(_object, "Monster")) {;
                            return true
                        } else {
                            return false
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(updateMonster, [newHolder, game]), _ret)
                    };
                    var _bool = (function () {
                        if (Lich.dataMatch(_object, "Player")) {;
                            return true
                        } else {
                            return false
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(updatePlayer, [newHolder, game]), _ret)
                    };
                    var _bool = (function () {
                        if (Lich.dataMatch(_object, "Location")) {;
                            return true
                        } else {
                            return false
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(updateLocation, [newHolder, game]), _ret)
                    };
                    throw new Error("case statement found no matching patterns.")
                })
            };
            return newGame
        })()), _ret)
    })
};;
curseItem = function curseItem(item, aCurse, location, game, _ret) {
    (function (_argRet) {
        Lich.collapse(item, function (itemRes) {
            item = itemRes;
            Lich.collapse(aCurse, function (aCurseRes) {
                aCurse = aCurseRes;
                Lich.collapse(location, function (locationRes) {
                    location = locationRes;
                    Lich.collapse(game, function (gameRes) {
                        game = gameRes;
                    })
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var newItem = (function (_ret) {
                Lich.dataUpdate(item, [{
                    id: "curse",
                    exp: aCurse
                }], _ret)
            });
            return Lich.application.curry(updateItemInHolder, [newItem, (function (_lookRet) {
                Lich.collapse(item, function (_lookRes) {
                    _lookRet(_lookRes["name"])
                })
            }), location, game])
        })()), _ret)
    })
};;
nullAction = function nullAction(item, holder, receiver, game, _ret) {
    (function (_argRet) {
        Lich.collapse(item, function (itemRes) {
            item = itemRes;
            Lich.collapse(holder, function (holderRes) {
                holder = holderRes;
                Lich.collapse(receiver, function (receiverRes) {
                    receiver = receiverRes;
                    Lich.collapse(game, function (gameRes) {
                        game = gameRes;
                    })
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(Lich.application.curry(addNarration, [game, "That has no effect."]), _ret)
    })
};;
useItemOnSomething = function useItemOnSomething(playerName, itemName, receiverName, game, _ret) {
    (function (_argRet) {
        Lich.collapse(playerName, function (playerNameRes) {
            playerName = playerNameRes;
            Lich.collapse(itemName, function (itemNameRes) {
                itemName = itemNameRes;
                Lich.collapse(receiverName, function (receiverNameRes) {
                    receiverName = receiverNameRes;
                    Lich.collapse(game, function (gameRes) {
                        game = gameRes;
                    })
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var player = Lich.application.curry(getPlayer, [playerName, game]);
            var item = Lich.application.curry(Lich.VM.reserved["!!"], [(function (_lookRet) {
                Lich.collapse(play, function (_lookRes) {
                    _lookRet(_lookRes["items"])
                })
            }), itemName]);
            var something = findSomethingWithName;
            return Lich.application.curry((function (_lookRet) {
                Lich.collapse(item, function (_lookRes) {
                    _lookRet(_lookRes["action"])
                })
            }), [item, player, something, game])
        })()), _ret)
    })
};;
nullAction = function nullAction(item, holder, receiver, game, _ret) {
    (function (_argRet) {
        Lich.collapse(item, function (itemRes) {
            item = itemRes;
            Lich.collapse(holder, function (holderRes) {
                holder = holderRes;
                Lich.collapse(receiver, function (receiverRes) {
                    receiver = receiverRes;
                    Lich.collapse(game, function (gameRes) {
                        game = gameRes;
                    })
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(Lich.application.curry(addNarration, [game, "That has no effect."]), _ret)
    })
};;
closedMetalDoor = function closedMetalDoor(name, _ret) {
    (function (_argRet) {
        Lich.collapse(name, function (nameRes) {
            name = nameRes;;
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var farDescription = "A sturdy looking metal door. It's closed.";
            var description = "Seems to be made of stern stuff. Not getting through here without the key.";
            var carryable = false;
            var action = Lich.VM.Nothing;
            var curse = Lich.VM.Nothing;
            return (function (_ret) {
                Lich.newData(Item, [name, farDescription, description, carryable, action, curse], _ret)
            })
        })()), _ret)
    })
};;
openedMetalDoor = function openedMetalDoor(name, _ret) {
    (function (_argRet) {
        Lich.collapse(name, function (nameRes) {
            name = nameRes;;
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var farDescription = "A sturdy looking metal door. It's wide open.";
            var description = "Seems to be made of stern stuff.";
            var carryable = false;
            var action = Lich.VM.Nothing;
            var curse = Lich.VM.Nothing;
            return (function (_ret) {
                Lich.newData(Item, [name, farDescription, description, carryable, action, curse], _ret)
            })
        })()), _ret)
    })
};;
openDoorWithKey = function openDoorWithKey(key, player, door, location, game, _ret) {
    (function (_argRet) {
        Lich.collapse(key, function (keyRes) {
            key = keyRes;
            Lich.collapse(player, function (playerRes) {
                player = playerRes;
                Lich.collapse(door, function (doorRes) {
                    door = doorRes;
                    Lich.collapse(location, function (locationRes) {
                        location = locationRes;
                        Lich.collapse(game, function (gameRes) {
                            game = gameRes;
                        })
                    })
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var newDoor = Lich.application.curry(openedMetalDoor, ["OpenMetalDoor"]);
            var newPlayer = Lich.application.curry(removeItemFromPlayer, [key, player]);
            var newLocation = Lich.application.curry(placeItemAtLocation, [newDoor]);
            var newGame = function (_ret) {
                Lich.collapse(Lich.application.curry(member, [(function (_lookRet) {
                    Lich.collapse(door, function (_lookRes) {
                        _lookRet(_lookRes["name"])
                    })
                }), (function (_lookRet) {
                    Lich.collapse(location, function (_lookRes) {
                        _lookRet(_lookRes["items"])
                    })
                })]), function (_object) {
                    var _bool = (function () {
                        if (_object !== true) {
                            return false
                        } else {
                            return true
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(Lich.application.curry(updatePlayer, [newPlayer]), [Lich.application.curry(updateLocation, [newLocation, game])]), _ret)
                    };
                    var _bool = (function () {
                        if (_object !== false) {
                            return false
                        } else {
                            return true
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(game, _ret)
                    };
                    throw new Error("case statement found no matching patterns.")
                })
            };
            return newGame
        })()), _ret)
    })
};;
closeDoor = function closeDoor(doorName, location, game, _ret) {
    (function (_argRet) {
        Lich.collapse(doorName, function (doorNameRes) {
            doorName = doorNameRes;
            Lich.collapse(location, function (locationRes) {
                location = locationRes;
                Lich.collapse(game, function (gameRes) {
                    game = gameRes;
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var newDoor = Lich.application.curry(closedMetalDoor, ["ClosedMetalDoor"]);
            var newLocation = Lich.application.curry(placeItemAtLocation, [newDoor]);
            var newGame = function (_ret) {
                Lich.collapse(Lich.application.curry(member, [doorName, (function (_lookRet) {
                    Lich.collapse(location, function (_lookRes) {
                        _lookRet(_lookRes["items"])
                    })
                })]), function (_object) {
                    var _bool = (function () {
                        if (_object !== true) {
                            return false
                        } else {
                            return true
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(Lich.application.curry(updateLocation, [newLocation, game]), _ret)
                    };
                    var _bool = (function () {
                        if (_object !== false) {
                            return false
                        } else {
                            return true
                        };
                    })();
                    if (_bool) {
                        return Lich.collapse(game, _ret)
                    };
                    throw new Error("case statement found no matching patterns.")
                })
            };
            return newGame
        })()), _ret)
    })
};;
key = ((function () {
    var name = "Key";
    var farDescription = "A metal key.";
    var description = "The key appears to be made from some kind of metal. Strangely you can feel a slight vibration and warmth emmiting from it.";
    var carryable = true;
    var action = openDoorWithKey;
    var curse = Lich.VM.Nothing;
    return (function (_ret) {
        Lich.newData(Item, [name, farDescription, description, carryable, action, curse], _ret)
    })
})());
Lich.collapse(key, function (_res) {
    key = _res;
});;
acidTrap = ((function () {
    var name = "Acid Trap";
    var desc = "A jet of acid suddenly shoots from the ground under you. You are burned.";
    var attack = 20;
    var demen = 5;
    return (function (_ret) {
        Lich.newData(Trap, [name, desc, attack, demen], _ret)
    })
})());
Lich.collapse(acidTrap, function (_res) {
    acidTrap = _res;
});;
revelation = ((function () {
    var name = "A hideous revelation";
    var desc = "All at once an insane revelation enters your mind. You are overcome with a vision from beyond dimensions, revealing to you just how small a mote your existence is in comparision to the vast NOTHINGNESS of the entire universe. You feel yourself losing grip with sanity.";
    var attack = 0;
    var demen = 20;
    return (function (_ret) {
        Lich.newData(Trap, [name, desc, attack, demen], _ret)
    })
})());
Lich.collapse(revelation, function (_res) {
    revelation = _res;
});;
dogCorpse = ((function () {
    var name = "DogCorpse";
    var fDesc = "On the ground lays a dessicated dog corpse. It seems to have been here awhile.";
    var desc = "Upon closer inspection I find that it appears to have been mauled. The teeth, or claw, wounds seemed to have left a star like pattern.";
    return (function (_ret) {
        Lich.newData(Item, [name, fDesc, desc], _ret)
    })
})());
Lich.collapse(dogCorpse, function (_res) {
    dogCorpse = _res;
});;
corpse = ((function () {
    var name = "Corpse";
    var fDesc = "The dessicated corpse of an antarctic researcher.";
    var desc = "It appears to have been...dissected. The brain is removed, as are several organs. The incisions appear to have been done with surgical precision.";
    return (function (_ret) {
        Lich.newData(Item, [name, fDesc, desc], _ret)
    })
})());
Lich.collapse(corpse, function (_res) {
    corpse = _res;
});;
corpse2 = ((function () {
    var name = "Corpse2";
    var fDesc = "A bloated corpse of a scientist";
    var desc = "Several of the scientist's limbs appear to have been amputated. This was not done by a wild animal as the wounds have been cauterized.";
    return (function (_ret) {
        Lich.newData(Item, [name, fDesc, desc], _ret)
    })
})());
Lich.collapse(corpse2, function (_res) {
    corpse2 = _res;
});;
diary = ((function () {
    var name = "Diary";
    var fDesc = "Amongst the tattered bedrolls I see a worn diary.";
    var desc = "The diary contains indeoth analyses of several in-field dissection conducted.";
    return (function (_ret) {
        Lich.newData(Item, [name, fDesc, desc], _ret)
    })
})());
Lich.collapse(diary, function (_res) {
    diary = _res;
});;
camp = ((function () {
    var n = "Mound";
    var s = "Nothing";
    var e = "Mound3";
    var w = "Mound2";
    var u = "Nothing";
    var d = "Nothing";
    var desc = "I stood amongst the ruins of my forward scout's base camp. They had gone missing. We are part of a small group of biologists exploring the reaches of Antartica. To the north, east, and west I can see three prominent mounds of snow. Given the scout's absence, this seemed ominous. ";
    var fDesc = "You see a white blasted, frigid looking camp.";
    var items = Lich.newDictionary.curry([
        ["Diary", diary]
    ]);
    var mov = true;
    return (function (_ret) {
        Lich.newData(Location, ["Camp", n, s, e, w, u, d, desc, fDesc, items, mov], _ret)
    })
})());
Lich.collapse(camp, function (_res) {
    camp = _res;
});;
mound = ((function () {
    var n = "Mountains";
    var s = "Camp";
    var e = "Mound3";
    var w = "Mound2";
    var u = "Nothing";
    var d = "Nothing";
    var desc = "Standing before me is a strange greenish mound in the snow. To the north are a series of mountains. To the south is the scout camp.";
    var fDesc = "the vauge outline of a small hill of some kind in the snow.";
    var items = Lich.newDictionary.curry([
        ["DogCorpse", dogCorpse]
    ]);
    var mov = true;
    return (function (_ret) {
        Lich.newData(Location, ["Mound", n, s, e, w, u, d, desc, fDesc, items, mov], _ret)
    })
})());
Lich.collapse(mound, function (_res) {
    mound = _res;
});;
mound2 = ((function () {
    var n = "Mound";
    var s = "Nothing";
    var e = "Camp";
    var w = "Nothing";
    var u = "Nothing";
    var d = "Nothing";
    var desc = "I am standing above a strange redish mound in the snow. To the east is the scout camp, to the north is another of these mounds.";
    var fDesc = "the vauge outline of a small hill of some kind in the snow.";
    var items = Lich.newDictionary.curry([
        ["Corpse", corpse]
    ]);
    var mov = true;
    return (function (_ret) {
        Lich.newData(Location, ["Mound2", n, s, e, w, u, d, desc, fDesc, items, mov], _ret)
    })
})());
Lich.collapse(mound2, function (_res) {
    mound2 = _res;
});;
mound3 = ((function () {
    var n = "Mound";
    var s = "Nothing";
    var e = "Nothing";
    var w = "Camp";
    var u = "Nothing";
    var d = "Nothing";
    var desc = "I am standing on a strange redish mound in the snow. To the west is the scout camp, to the north is another of these mounds.";
    var fDesc = "the vauge outline of a small hill of some kind in the snow.";
    var items = Lich.newDictionary.curry([
        ["Corpse2", corpse2]
    ]);
    var mov = true;
    return (function (_ret) {
        Lich.newData(Location, ["Mound3", n, s, e, w, u, d, desc, fDesc, items, mov], _ret)
    })
})());
Lich.collapse(mound3, function (_res) {
    mound3 = _res;
});;
mountains = ((function () {
    var n = "Nothing";
    var s = "Mound";
    var e = "MuralsTop";
    var w = "Ruins";
    var u = "Nothing";
    var d = "Nothing";
    var desc = "A series of precipitous and daunting cliffs. Arduous hiking.";
    var fDesc = "the peaks of a chain of peaks and cliffs. Looks dangerous.";
    var items = Lich.newDictionary.curry([]);
    var mov = true;
    return (function (_ret) {
        Lich.newData(Location, ["Mountains", n, s, e, w, u, d, desc, fDesc, items, mov], _ret)
    })
})());
Lich.collapse(mountains, function (_res) {
    mountains = _res;
});;
ruins = ((function () {
    var n = "Nothing";
    var s = "Nothing";
    var e = "Mountains";
    var w = "Nothing";
    var u = "Nothing";
    var d = "UnderRuins";
    var desc = "There are eldritch ruins; crumbling and falling, yet still holding some of their previous strange, and even dangerous, beauty.";
    var fDesc = "What appears to be ancient ruins of some sort of city.";
    var items = Lich.newDictionary.curry([]);
    var mov = true;
    return (function (_ret) {
        Lich.newData(Location, ["Ruins", n, s, e, w, u, d, desc, fDesc, items, mov], _ret)
    })
})());
Lich.collapse(ruins, function (_res) {
    ruins = _res;
});;
carvings = ((function () {
    var name = "Carvings";
    var fDesc = "Ornate carvings.";
    var desc = "Otherworldly carvings which depict, minimally yet beautifully, a large underground city. On closer inspection strange creatures can be seen inhabiting the structures. They appear to be dissecting...or dining...on something.";
    return (function (_ret) {
        Lich.newData(Item, [name, fDesc, desc], _ret)
    })
})());
Lich.collapse(carvings, function (_res) {
    carvings = _res;
});;
underRuins = ((function () {
    var n = "CityEntrance";
    var s = "Nothing";
    var e = "Nothing";
    var w = "Nothing";
    var u = "Ruins";
    var d = "UnderRuins";
    var desc = "The structures open up into an intricately carved passageway.";
    var fDesc = "There seems to be some kind of passageway leading underground.";
    var items = Lich.newDictionary.curry([
        ["Carvings", carvings]
    ]);
    var mov = true;
    return (function (_ret) {
        Lich.newData(Location, ["UnderRuins", n, s, e, w, u, d, desc, fDesc, items, mov], _ret)
    })
})());
Lich.collapse(underRuins, function (_res) {
    underRuins = _res;
});;
mural = ((function () {
    var name = "Mural";
    var fDesc = "Some kind of mural.";
    var desc = "An intricately constructed mural, made of some kind of crystalline materia. Seems almost religious or iconic in nature. Depicts a vaugely orb shaped creature with a multitude of appendages and sub-orb like structures. It appears to be swallowing something...or perhaps talking to it?";
    return (function (_ret) {
        Lich.newData(Item, [name, fDesc, desc], _ret)
    })
})());
Lich.collapse(mural, function (_res) {
    mural = _res;
});;
murals = ((function () {
    var n = "Nothing";
    var s = "Nothing";
    var e = "Nothing";
    var w = "Mountains";
    var u = "Nothing";
    var d = "UnderMurals";
    var desc = "A strange room-like structure, made of an unknown metallic material, and containing several crystalline murals. A portal seems to lead deeper down.";
    var fDesc = "There appears to be ruins of somekind, with glints of glass gleaming from them.";
    var items = Lich.newDictionary.curry([
        ["Mural", mural]
    ]);
    var mov = true;
    return (function (_ret) {
        Lich.newData(Location, ["Murals", n, s, e, w, u, d, desc, fDesc, items, mov], _ret)
    })
})());
Lich.collapse(murals, function (_res) {
    murals = _res;
});;
mural2 = ((function () {
    var name = "Mural2";
    var fDesc = "Some kind of mural.";
    var desc = "";
    return (function (_ret) {
        Lich.newData(Item, [name, fDesc, desc], _ret)
    })
})());
Lich.collapse(mural2, function (_res) {
    mural2 = _res;
});;
underMurals = ((function () {
    var n = "CityEntrance";
    var s = "Nothing";
    var e = "Nothing";
    var w = "Nothing";
    var u = "Murals";
    var d = "Nothing";
    var desc = "The portal leads deeper into the structure. There are more murals, and though you have clearly descended several hundred feet below the surface, an impossible light still radiates from behind them.";
    var fDesc = "It appears to be a portal leading deep underground.";
    var items = Lich.newDictionary.curry([
        ["Mural2", mural2]
    ]);
    var mov = true;
    return (function (_ret) {
        Lich.newData(Location, ["UnderMurals", n, s, e, w, u, d, desc, fDesc, items, mov], _ret)
    })
})());
Lich.collapse(underMurals, function (_res) {
    underMurals = _res;
});;
gameLocations = Lich.newDictionary.curry([
    ["Camp", camp],
    ["Mound", mound],
    ["Mound2", mound2],
    ["Mound3", mound3],
    ["Mountains", mountains],
    ["Ruins", ruins],
    ["UnderRuins", underRuins],
    ["Murals", murals],
    ["UnderMurals", underMurals]
]);
Lich.collapse(gameLocations, function (_res) {
    gameLocations = _res;
});;
demoPlayer = (function (_ret) {
    Lich.newData(Player, ["casiosk1", 100, "Camp"], _ret)
});
Lich.collapse(demoPlayer, function (_res) {
    demoPlayer = _res;
});;
demoShoggoth = (function (_ret) {
    Lich.newData(Monster, ["Shoggoth"], _ret)
});
Lich.collapse(demoShoggoth, function (_res) {
    demoShoggoth = _res;
});;
demoGame = (function (_ret) {
    Lich.newData(Game, [Lich.newDictionary.curry([
        ["casiosk1", demoPlayer]
    ]), Lich.newDictionary.curry([
        ["Shoggoth", demoShoggoth]
    ]), gameLocations], _ret)
});
Lich.collapse(demoGame, function (_res) {
    demoGame = _res;
});;
moveFunc = function moveFunc(cardinal, game, _ret) {
    (function (_argRet) {
        Lich.collapse(cardinal, function (cardinalRes) {
            cardinal = cardinalRes;
            Lich.collapse(game, function (gameRes) {
                game = gameRes;
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(Lich.application.curry(movePlayer, [cardinal, Lich.application.curry(getPlayer, ["casiosk1"]), game]), _ret)
    })
};;
madnessLoop = function madnessLoop(game, _ret) {
    (function (_argRet) {
        Lich.collapse(game, function (gameRes) {
            game = gameRes;;
            _argRet()
        })
    })(function () {;
        Lich.collapse(Lich.receive.curry(function (_object, _patRet) {
            if ((function () {
                if (_object !== "walk") {
                    return false
                } else {
                    return true
                };
            })()) {
                return _patRet(true, Lich.application.curry(madnessLoop, [Lich.application.curry(movePlayer, [north, Lich.application.curry(getPlayer, ["casiosk1", game]), game])]))
            };
            if ((function () {
                if (_object !== "finished") {
                    return false
                } else {
                    return true
                };
            })()) {
                return _patRet(true, game)
            };
            _patRet(false)
        }), _ret)
    })
};;
startMountainsOfMadness = function startMountainsOfMadness(playerName, _ret) {
    (function (_argRet) {
        Lich.collapse(playerName, function (playerNameRes) {
            playerName = playerNameRes;;
            _argRet()
        })
    })(function () {;
        Lich.collapse(((function () {
            var newPlayer = (function (_ret) {
                Lich.newData(Player, [playerName, 100, "Camp"], _ret)
            });
            var newGame = (function (_ret) {
                Lich.newData(Game, [Lich.newDictionary.curry([
                    [playerName, newPlayer]
                ]), Lich.newDictionary.curry([]), gameLocations], _ret)
            });
            return Lich.application.curry(spawn, [madnessLoop, Lich.listExp.curry([newGame])])
        })()), _ret)
    })
};;
walk = function walk(cardinal, playerName, game, _ret) {
    (function (_argRet) {
        Lich.collapse(cardinal, function (cardinalRes) {
            cardinal = cardinalRes;
            Lich.collapse(playerName, function (playerNameRes) {
                playerName = playerNameRes;
                Lich.collapse(game, function (gameRes) {
                    game = gameRes;
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(Lich.application.curry(movePlayer, [cardinal, Lich.application.curry(getPlayer, [playerName, game]), game]), _ret)
    })
};;
look = function look(cardinal, playerName, game, _ret) {
    (function (_argRet) {
        Lich.collapse(cardinal, function (cardinalRes) {
            cardinal = cardinalRes;
            Lich.collapse(playerName, function (playerNameRes) {
                playerName = playerNameRes;
                Lich.collapse(game, function (gameRes) {
                    game = gameRes;
                })
            });
            _argRet()
        })
    })(function () {;
        Lich.collapse(Lich.application.curry(lookAtCardinal, [cardinal, Lich.application.curry(findSomethingWithName, [playerName, game]), game]), _ret)
    })
};
Done compiling module: Main