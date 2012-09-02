//This file is part of BohranderJS

var Game = function(gameElm, hard) {
  var target = $(gameElm);
  
  var level = 1;
  var life = 3;
  var keysChangeRemainingTime = 20;
  var up = null;
  var down = null;
  var left = null;
  var right = null;
  
  this.getLevel = function() {
    return level;
  };
  this.getLife = function() {
    return life;
  };
  this.getKeysChangeRemainingTime = function() {
    return keysChangeRemainingTime;
  };
  this.getUp = function() {
    return up;
  };
  this.getDown = function() {
    return down;
  };
  this.getLeft = function() {
    return left;
  };
  this.getRight = function() {
    return right;
  };
  
  var onLevelChanged = null;
  var onLifeChanged = null;
  var onKeysChanged = null;
  var onKeysChangeRemainingTimeChanged = null;
  var onGameOver = null;
  
  this.setOnLevelChanged = function(handler) {
    onLevelChanged = handler;
  };
  this.setOnLifeChanged = function(handler) {
    onLifeChanged = handler;
  };
  this.setOnKeysChanged = function(handler) {
    onKeysChanged = handler;
  };
  this.setOnKeysChangeRemainingTimeChanged = function(handler) {
    onKeysChangeRemainingTimeChanged = handler;
  };
  this.setOnGameOver = function(handler) {
    onGameOver = handler;
  };
  
  var Unit = function() {
    this.x;
    this.y;
    this.width;
    this.height;
    
    this.jqObj;
    
    this.isBumping = function(otherUnit) {
      return otherUnit.x < this.x + this.width
        && this.x < otherUnit.x + otherUnit.width
        && otherUnit.y < this.y + this.height
        && this.y < otherUnit.y + otherUnit.height;
    };
    
    this.apply = function() {
      this.jqObj.css("left", this.x + "px")
        .css("top", this.y + "px")
        .css("width", this.width + "px")
        .css("height", this.height + "px");
    };
  };
  
  var me = null;
  var enemies = [];
  
  var interval = null;
  
  this.start = function() {
    target.html("");
    me = new Unit();
    me.width = 24;
    me.height = 24;
    me.x = target.width() / 2 - 12;
    me.y = target.height() - 40;
    me.jqObj = $("<div />").addClass("me").appendTo(target);
    me.apply();
    
    $("body").keydown(function(e) {
      if (up == e.which) {
        var y = me.y - 10;
        if (y < 0) y = 0;
        me.y = y;
      } else if (down == e.which) {
        var y = me.y + 10;
        if (y > target.height() - me.height) y = target.height() - me.height;
        me.y = y;
      } else if (left == e.which) {
        var x = me.x - 10;
        if (x < 0) x = 0;
        me.x = x;
      } else if (right == e.which) {
        var x = me.x + 10;
        if (x > target.width() - me.width) x = target.width() - me.width;
        me.x = x;
      }
      
      me.apply();
    });
    
    if (onLevelChanged != null)
      onLevelChanged();
    if (onLifeChanged != null)
      onLifeChanged();
    if (onKeysChangeRemainingTimeChanged != null)
      onKeysChangeRemainingTimeChanged();
    createKeys();
    interval = setInterval(frame, 50);
  };
  
  var createKeys = function() {
    var result = [];
    
    while(true) {
      var num = Math.floor(Math.random() * 26)
      if (!Enumerable.from(result).contains(num))
        result.push(num);
      if (result.length == 4)
        break;
    }
    
    up = result[0] + 65;
    down = result[1] + 65;
    left = result[2] + 65;
    right = result[3] + 65;
    
    if (onKeysChanged != null)
      onKeysChanged();
  };
  
  var levelFrames = 0;
  var keysChangeFrames = 0;
  
  var frame = function() {
    if (++levelFrames == 60) {
      level++;
      if (onLevelChanged != null)
        onLevelChanged();
      
      levelFrames = 0;      
    }
    
    if (++keysChangeFrames == 400) {
      createKeys();
      
      keysChangeFrames = 0;
      keysChangeRemainingTime = 20;
      if (onKeysChangeRemainingTimeChanged != null)
        onKeysChangeRemainingTimeChanged();
    } else {
      keysChangeRemainingTime = 20 - Math.floor(keysChangeFrames / 20);
      if (onKeysChangeRemainingTimeChanged != null)
        onKeysChangeRemainingTimeChanged();
    }
    
    var flagHit = false;
    var newArray = Enumerable.from(enemies)
      .where(function(enemy) {
        if (!Enumerable.range(enemy.y, 5 + level).all(function(i) { enemy.y = i; return !me.isBumping(enemy) })) {
          flagHit = true;
          return false;
        } else if (enemy.y > target.height()) {
          return false;
        }
        
        return true;
      })
      .toArray();
    
    if (flagHit) {
      life--;
      
      if (onLifeChanged != null)
        onLifeChanged();
      
      if (life == 0) {
        clearInterval(interval);
        $("body").unbind("keydown");
        if (onGameOver != null)
          onGameOver();
        return;
      }
    }
    
    Enumerable.from(enemies).except(newArray)
      .forEach(function(enemy) { enemy.jqObj.remove(); })
    
    enemies = newArray;
    
    if (Math.floor(Math.random() * (hard ? 4 : 5)) == 0) {
      var newEnemy = new Unit();
      newEnemy.width = 20;
      newEnemy.height = 20;
      if (hard)
        newEnemy.x = Math.min(Math.max(me.x - 60, 0) + Math.floor(Math.random() * (me.width + 120)), target.width() - newEnemy.width);
      else
        newEnemy.x = Math.floor(Math.random() * (target.width() - newEnemy.width));
      newEnemy.y = 0;
      newEnemy.jqObj = $("<div />").addClass("enemy").appendTo(target);
      enemies.push(newEnemy);
    }
    
    Enumerable.from(enemies).forEach("$.apply()");
  };
};
