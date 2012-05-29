function new_game() {   
}

function make_move() {
   var board = get_board();
   var _items = items().new();
   var _values = _items.get_item_values();

   // we found an item! take it!
   if (board[get_my_x()][get_my_y()] > 0) {
       return TAKE;
   }

   // Get the most valuable type.
   var _most_valuable_item_type = items.find_most_valuable_item_type();
      
   // Go get it.
   var _target_pos = _items.find_nearest_item_with_type(get_my_position(), _most_valuable_item_type)
   if((get_my_x() - _target_pos.x) > 0) return WEST;
   if((get_my_x() - _target_pos.x) < 0) return EAST;
   if((get_my_y() - _target_pos.y) > 0) return NORTH;
   if((get_my_y() - _target_pos.y) < 0) return SOUTH;

   return PASS;

   // We only need to win each category.
   // Should every square recieve a expected value?
   // Should we group these items and then perhaps attack most valuable group?

   /*
      Steps:
         1. Group each type of item.
         2. Find the number of items needed in that category to win.
         3. Find the closest grouping of the winning number of items in that category.
         4. Assign value to each catagorie type.
   */
}

// define value of a fruit as distance to every other fruit.
function get_distance(pos1, pos2){
   return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y-pos2.y);
}

function get_my_position(){
 return {x: get_my_x(), y: get_my_y()};
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
      var _type = this._value_of_each_item_type.indexOf(Math.max.apply(Math, this._value_of_each_item_type)) + 1;
      
      var _number_taken = (get_my_item_count(_type) + get_opponent_item_count(_type));
      
      if(get_total_item_count(_type) - _number_taken == 0){
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

  items.get_clusters = function(type_index){
      type_index = type_index || 1;
      var _source = this.get_ranked_type_distance_matrix(type_index);          
   }

   // Distance is defined as the number of moves from one cell to another.
   items.get_distance_to_items = function(cell){
      cell = cell || get_my_position();
      if(!this._found_items) this.find_items();
      
      var _all_items = [];
      for (key in this._found_items) {
         _all_items = _all_items.concat(this._found_items[key]);
      };

      return _all_items;
   }

   // This is the percentage of the total items in a given category each item represents.
   items.get_item_values = function(){
      this._value_of_each_item_type = [];
      for (var i = get_number_of_item_types(); i > 0; i--) {
         this._value_of_each_item_type[i - 1] = Math.pow(get_total_item_count(i), -1);
      }

      return this._value_of_each_item_type
   }

   items.get_ranked_type_distance_matrix = function(type_index){
      type_index = type_index || 1;
      var _source = this.get_type_distance_matrix(type_index),
          _result_matrix = [];

      for (var i = 0; i <= _source.length - 1; i++) {
         var _sorted = _source[i].slice(0).sort(),
             _result_column = [];

         for (var j = 0; j <= _sorted.length - 1; j++) {
            var _pos = _source[i].indexOf(_sorted[j]);
            _result_column.push(_pos);
            _source[i][_pos] = null;
         };

         // Use slice to remove first element since it is always the item itself.
         _result_matrix.push(_result_column.slice(1));
      };

      return _result_matrix
   }

   items.get_type_distance_matrix = function(type_index){
     type_index = type_index || 1;
     if(!this._found_items) this.find_items();
     var _group = this._found_items[type_index];
     var _result_matrix = [];

     for (var i = _group.length - 1; i >= 0; i--) {
         var _result_column = [],
            obj = _group[i];

         for (var j = _group.length - 1; j >= 0; j--) {
            _result_column.push(get_distance(obj,_group[j]));
         };
         _result_matrix.push(_result_column);
     };

     return _result_matrix;
   }

   return items;
}