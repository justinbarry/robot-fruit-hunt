function new_game() {   
}

function make_move() {
   var board = get_board(),
       _items = items().new();

   // Get the most valuable type.
   var _most_valuable_item_type = items.find_most_valuable_item_type();
         
   // Go get it. If the game is over just wait.
   var _target_pos = _most_valuable_item_type ? _items.find_nearest_item_with_type(get_my_position(), _most_valuable_item_type) : get_my_position();

   // There is a fruit on our current position.
   if (board[get_my_x()][get_my_y()] > 0){
      var _value = _items.get_item_values()[_most_valuable_item_type - 1];

      if(get_distance(get_opponent_position(), _target_pos) > get_distance(get_my_position(), _target_pos)){
         return TAKE;
      }
   }

   if((get_my_x() - _target_pos.x) > 0) return WEST;
   if((get_my_x() - _target_pos.x) < 0) return EAST;
   if((get_my_y() - _target_pos.y) > 0) return NORTH;
   if((get_my_y() - _target_pos.y) < 0) return SOUTH;

   return PASS;
}

// Define distance as number of move to get from on fruit to another.
function get_distance(pos1, pos2){
   return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y-pos2.y);
}

function get_my_position(){
   return {x: get_my_x(), y: get_my_y()};
}

function get_opponent_position(){
   return {x: get_opponent_x(), y: get_opponent_y()};
}

function get_my_distance_from_opponent(){
   return get_distance(get_my_position(), get_opponent_position());
}

function items(){
   items.new = function(board){
      this._board = board || get_board();
      return items;
   };

   // Find all the items on the board and group by type.
   items.find_items = function(){
      this._found_items = {};
      for (var i = this._board.length - 1; i >= 0; i--) {
         for (var j = this._board[i].length - 1; j >= 0; j--) {
            var _item_type = this._board[i][j];
            if(has_item(_item_type)) {
               this._found_items[_item_type] = this._found_items[_item_type] || [];
               this._found_items[_item_type].push({x: i, y: j});
            }
         };
      };
      return this._found_items;
   }

   items.find_most_valuable_item_type = function(){
      if(!this._value_of_each_item_type) this.get_item_values();
      var _value = Math.max.apply(Math, this._value_of_each_item_type);
      
      // The happens when the game is in a finished state.
      if(!_value){return null}

      var _type = this._value_of_each_item_type.indexOf(_value) + 1,
          _number_taken = (get_my_item_count(_type) + get_opponent_item_count(_type)),
          _number_total = get_total_item_count(_type);

      // Figure out this type is "winnable"
      if(   (_number_total - _number_taken == 0) // There is none left of that type.
         || (get_opponent_item_count(_type) / _number_total > 0.5) // They have won that item type.
         || (get_my_item_count(_type) / _number_total > 0.5) // I have won that item type.
      ){
         // Set value to zero for types with no outstanding pieces on the board
         this._value_of_each_item_type[_type - 1] = null;
         return this.find_most_valuable_item_type();
      }

      return _type;
   }

   items.find_nearest_item_with_type = function(pos, type_index){
     this.find_items();
     var _result, _current_distance = 1000;

     for (var i = this._found_items[type_index].length - 1; i >= 0; i--) {
         var _candidate_distance = get_distance(pos, this._found_items[type_index][i]);
         if(_current_distance > _candidate_distance){
            _result = this._found_items[type_index][i];
            _current_distance = _candidate_distance;
         }
     };

     return _result;
   }

   // This is the percentage of the total items in a given category each item represents.
   items.get_item_values = function(){
      this._value_of_each_item_type = [];
      for (var i = get_number_of_item_types(); i > 0; i--) {
         this._value_of_each_item_type[i - 1] = Math.pow(get_total_item_count(i), -1);
      }

      return this._value_of_each_item_type
   }

   return items;
}