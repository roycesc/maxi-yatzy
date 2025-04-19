'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var utils_1 = require("@/lib/utils");
var scoring_1 = require("@/lib/game/scoring");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
// Add mobile touch detection
var isTouchDevice = function () {
    if (typeof window === 'undefined')
        return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};
var UPPER_SECTION = [
    { id: 'ones', label: '1s', index: 0 },
    { id: 'twos', label: '2s', index: 1 },
    { id: 'threes', label: '3s', index: 2 },
    { id: 'fours', label: '4s', index: 3 },
    { id: 'fives', label: '5s', index: 4 },
    { id: 'sixes', label: '6s', index: 5 },
];
var LOWER_SECTION = [
    { id: 'onePair', label: '1 Pair', index: 6 },
    { id: 'twoPairs', label: '2 Pairs', index: 7 },
    { id: 'threePairs', label: '3 Pairs', index: 8 },
    { id: 'threeOfAKind', label: 'Three of a Kind', index: 9 },
    { id: 'fourOfAKind', label: 'Four of a Kind', index: 10 },
    { id: 'fiveOfAKind', label: 'Five of a Kind', index: 11 },
    { id: 'smallStraight', label: 'Small Straight', index: 12 },
    { id: 'largeStraight', label: 'Large Straight', index: 13 },
    { id: 'fullStraight', label: 'Full Straight', index: 14 },
    { id: 'fullHouse', label: 'Full House', index: 15 },
    { id: 'villa', label: 'Villa', index: 16 },
    { id: 'tower', label: 'Tower', index: 17 },
    { id: 'chance', label: 'Chance', index: 18 },
    { id: 'maxiYatzy', label: 'Maxi Yatzy', index: 19 },
];
// Component for call-out button
var CallOutButton = function (_a) {
    var onClick = _a.onClick, position = _a.position, value = _a.value, isActive = _a.isActive, isPotentiallyZero = _a.isPotentiallyZero;
    if (!isActive)
        return null;
    
    // Enhanced positioning for buttons
    const buttonPosition = position === 'left' 
        ? { 
            left: '-3.5rem',
          } 
        : { 
            right: '-3.5rem', 
          };
    
    return (
        <div 
            className="absolute inset-0 pointer-events-none overflow-visible"
            style={{ 
                pointerEvents: 'none',
                isolation: 'isolate', // Create a new stacking context
                overflow: 'visible'
            }}
        >
            {/* Line connecting button to cell */}
            {position === 'left' ? (
              <div className={(0, utils_1.cn)(
                "absolute top-1/2 h-0.5 right-full w-3", 
                isPotentiallyZero ? "bg-red-300" : "bg-main-blue/30"
              )} />
            ) : (
              <div 
                style={{ 
                  position: 'absolute',
                  left: '100%', 
                  top: '50%',
                  width: '0.75rem',
                  height: '0.125rem',
                }}
                className={(0, utils_1.cn)(
                  isPotentiallyZero ? "bg-red-300" : "bg-main-blue/30"
                )}
              />
            )}
            <button 
              onClick={function (e) {
                  e.preventDefault();
                  e.stopPropagation();
                  // Ensure direct click on button always works
                  if (onClick) onClick();
              }} 
              style={{
                ...buttonPosition,
                pointerEvents: 'auto',
                cursor: 'pointer',
                position: 'absolute',
                isolation: 'isolate',
                transform: 'translateY(-50%)',
                willChange: 'transform',
                zIndex: position === 'right' ? 20 : 20
              }}
              className={(0, utils_1.cn)(
                "absolute top-1/2", 
                "w-12 h-12 flex items-center justify-center", 
                isPotentiallyZero
                  ? "bg-red-50 hover:bg-red-100 active:bg-red-200 border-red-200"
                  : position === 'right' 
                    ? "bg-main-blue/30 hover:bg-main-blue/50 active:bg-main-blue/70 border-main-blue/40" 
                    : "bg-main-blue/15 hover:bg-main-blue/25 active:bg-main-blue/40 border-main-blue/20", 
                "rounded-full shadow-md border", 
                "touch-manipulation transition-colors duration-150",
                position === 'right' ? "z-[100000]" : "z-[9999]",
              )} 
              aria-label={"Select score ".concat(value)}>
              <div className="relative w-full h-full flex items-center justify-center">
                <span className={(0, utils_1.cn)(
                  "text-base font-semibold", 
                  isPotentiallyZero 
                    ? "text-red-500" 
                    : position === 'right' ? "text-main-blue font-bold" : "text-main-blue"
                )}>
                  {value}
                </span>
              </div>
            </button>
        </div>
    );
};
// Component for cell highlight to indicate selectability
var SelectableHighlight = function (_a) {
    var isActive = _a.isActive, isPotentiallyZero = _a.isPotentiallyZero, _b = _a.isFocused, isFocused = _b === void 0 ? false : _b;
    if (!isActive)
        return null;
    return (<div className={(0, utils_1.cn)("absolute inset-0 pointer-events-none", isPotentiallyZero
            ? "bg-red-50/40 border border-red-200/50"
            : "bg-main-blue/5 border border-main-blue/30", isFocused && "bg-main-blue/10", "rounded-md transition-colors duration-150")}/>);
};
var ScoreCard = function (_a) {
    var players = _a.players, _b = _a.currentDice, currentDice = _b === void 0 ? [] : _b, onScoreSelect = _a.onScoreSelect, currentPlayerId = _a.currentPlayerId;
    // State for the zero score confirmation dialog
    var _c = (0, react_1.useState)(false), confirmDialogOpen = _c[0], setConfirmDialogOpen = _c[1];
    var _d = (0, react_1.useState)(null), selectedCategory = _d[0], setSelectedCategory = _d[1];
    // State to track which cell is currently focused (for showing callout buttons)
    var _e = (0, react_1.useState)(null), focusedCell = _e[0], setFocusedCell = _e[1];
    // Detect if we're on a touch device for better mobile experience
    var _f = (0, react_1.useState)(false), isMobileDevice = _f[0], setIsMobileDevice = _f[1];
    // Additional state to detect if we're on a tablet
    var _g = (0, react_1.useState)(false), isTablet = _g[0], setIsTablet = _g[1];
    // Ref for table container to help with responsive positioning
    var tableContainerRef = (0, react_1.useRef)(null);
    // Detect touch devices and screen size on mount
    (0, react_1.useEffect)(function () {
        var checkDeviceType = function () {
            setIsMobileDevice(isTouchDevice());
            // Consider tablets to be devices with width between 640px and 1024px
            setIsTablet(window.innerWidth >= 640 && window.innerWidth <= 1024);
        };
        checkDeviceType();
        // Also listen for resize events to update tablet status
        window.addEventListener('resize', checkDeviceType);
        return function () { return window.removeEventListener('resize', checkDeviceType); };
    }, []);
    // Close focused cell when clicking outside the table
    (0, react_1.useEffect)(function () {
        var handleClickOutside = function (e) {
            if (tableContainerRef.current && !tableContainerRef.current.contains(e.target)) {
                setFocusedCell(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return function () { return document.removeEventListener('mousedown', handleClickOutside); };
    }, []);
    var potentialScores = currentDice.length === 6
        ? (0, scoring_1.calculatePotentialScores)(currentDice)
        : {};
    var currentPlayer = players.find(function (p) { return p.id === currentPlayerId; });
    var handleCellFocus = function (playerId, categoryId) {
        setFocusedCell({ playerId: playerId, categoryId: categoryId });
    };
    var handleCategorySelect = function (category) {
        var potential = potentialScores[category];
        
        // Ensure we actually call the score selection callback
        if (onScoreSelect) {
            // If potential score is 0 but there could be a positive score option,
            // show confirmation dialog
            if (potential === 0 && hasPositiveScoreOptions()) {
                setSelectedCategory(category);
                setConfirmDialogOpen(true);
            } else {
                // Otherwise just select the score
                onScoreSelect(category);
            }
        }
    };
    var hasPositiveScoreOptions = function () {
        // Check if any category could have a positive score
        return Object.values(potentialScores).some(function (score) { return score > 0; });
    };
    var confirmZeroScore = function () {
        if (selectedCategory && onScoreSelect) {
            onScoreSelect(selectedCategory);
            setConfirmDialogOpen(false);
            setSelectedCategory(null);
        }
    };
    var cancelZeroScore = function () {
        setConfirmDialogOpen(false);
        setSelectedCategory(null);
    };
    var calculateUpperSectionSubtotal = function (scoreCard) {
        return UPPER_SECTION.reduce(function (sum, category) {
            var score = scoreCard[category.id];
            return sum + (score !== null && score !== void 0 ? score : 0);
        }, 0);
    };
    var calculateUpperSectionBonus = function (scoreCard) {
        var upperTotal = calculateUpperSectionSubtotal(scoreCard);
        return upperTotal >= 84 ? 100 : 0;
    };
    var calculateTotal = function (scoreCard) {
        var upperTotal = calculateUpperSectionSubtotal(scoreCard);
        var bonus = calculateUpperSectionBonus(scoreCard);
        var lowerTotal = LOWER_SECTION.reduce(function (sum, category) {
            var score = scoreCard[category.id];
            return sum + (score !== null && score !== void 0 ? score : 0);
        }, 0);
        return upperTotal + bonus + lowerTotal;
    };
    var availableUpperSection = UPPER_SECTION;
    var availableLowerSection = LOWER_SECTION;
    // Determine button position (alternating left/right based on category index)
    var getButtonPosition = function (categoryId) {
        var _a, _b;
        // Find the category from our known lists
        var upperCategory = UPPER_SECTION.find(function (c) { return c.id === categoryId; });
        var lowerCategory = LOWER_SECTION.find(function (c) { return c.id === categoryId; });
        // Get the index from the found category
        var index = (_b = (_a = upperCategory === null || upperCategory === void 0 ? void 0 : upperCategory.index) !== null && _a !== void 0 ? _a : lowerCategory === null || lowerCategory === void 0 ? void 0 : lowerCategory.index) !== null && _b !== void 0 ? _b : 0;
        // Alternate based on whether index is even or odd
        return index % 2 === 0 ? 'left' : 'right';
    };
    // Score Card Container
    return (<>
      <div className="ml-4 mt-2 flex items-center h-full relative" style={{ overflow: 'visible', isolation: 'isolate', zIndex: 10 }}>
        <div className="flex flex-1 h-full relative" style={{ overflow: 'visible', isolation: 'isolate', zIndex: 10 }}>
          <div
            className="m-1 h-full w-auto rounded-3xl border border-white/40 dark:border-white/10 shadow-2xl ring-1 ring-white/30 bg-white/20 dark:bg-zinc-900/40 backdrop-blur-2xl backdrop-saturate-200 transition-all duration-300 p-2 md:p-8  relative"
            ref={tableContainerRef}
            style={{ position: 'relative', zIndex: 10, overflow: 'visible', isolation: 'isolate' }}
          >
            <table className="w-full border-collapse bg-transparent text-xs h-full rounded-2xl z-10 relative" style={{ overflow: 'visible' }}>
              <thead className="sticky top-0 z-20">
                <tr className="rounded-t-2xl">
                  <th className="px-1 py-0.5 text-left font-medium w-auto whitespace-nowrap">
                    Category
                  </th>
                  {players.map(function (player, idx) { return (<th key={player.id} className={(0, utils_1.cn)("px-1 py-0.5 text-center w-auto font-medium whitespace-nowrap ", player.isActive && "bg-accent-orange/80 text-white", idx === players.length - 1)}>{player.name}</th>); })}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 dark:divide-zinc-800/40 flex-1" style={{ overflow: 'visible' }}>

                {availableUpperSection.map(function (category) { return (<tr key={category.id} className="transition-colors">
                    <td className="px-2 py-0.5 w-auto text-left border-b border-white/20 dark:border-zinc-800/40 font-medium text-sm text-gray-700 dark:text-zinc-200 rounded-lg whitespace-nowrap">
                      {category.label}
                    </td>
                    {players.map(function (player) {
                var isSelectable = player.id === currentPlayerId &&
                    player.scoreCard[category.id] === null &&
                    currentDice.length === 6;
                var isPotentiallyZero = isSelectable && (potentialScores[category.id] === 0);
                var isCellFocused = (focusedCell === null || focusedCell === void 0 ? void 0 : focusedCell.playerId) === player.id && (focusedCell === null || focusedCell === void 0 ? void 0 : focusedCell.categoryId) === category.id;
                var shouldShowCallout = isSelectable && (isMobileDevice ||
                    isTablet ||
                    isCellFocused);
                var buttonPosition = getButtonPosition(category.id);
                
                return (<td key={"".concat(player.id, "-").concat(category.id)} className={(0, utils_1.cn)(
                  "border-b border-white/20 dark:border-zinc-800/40 text-center px-1 py-1 relative rounded-lg transition-all duration-150",
                  isCellFocused || isSelectable ? "bg-white/30 dark:bg-zinc-800/40 backdrop-blur-sm" : "",
                  player.id === currentPlayerId && "bg-main-blue/10 dark:bg-main-blue/20",
                  isSelectable && "cursor-pointer",
                  player.scoreCard[category.id] !== null && "text-gray-900 dark:text-zinc-100 font-medium"
                )} 
                style={{
                    overflow: 'visible',
                    position: 'relative',
                    // Add zIndex to td when it's selectable, especially for right-positioned buttons
                    zIndex: isSelectable ? (buttonPosition === 'right' ? 101000 : 100999) : 'auto'
                }}
                onClick={function (e) {
                        if (isSelectable) {
                            // If the cell is not already focused, just focus it
                            if (!isCellFocused) {
                                e.stopPropagation();
                                e.preventDefault();
                                handleCellFocus(player.id, category.id);
                            }
                            else {
                                // If already focused, select the category
                                e.stopPropagation();
                                e.preventDefault();
                                handleCategorySelect(category.id);
                            }
                        }
                    }}>
                          {/* Visual highlight for selectable cells */}
                          <SelectableHighlight isActive={isSelectable} isPotentiallyZero={isPotentiallyZero} isFocused={isCellFocused}/>
                          {/* Call-out button */}
                          {shouldShowCallout && (<CallOutButton onClick={function () { return handleCategorySelect(category.id); }} position={buttonPosition} value={potentialScores[category.id] || 0} isActive={isSelectable} isPotentiallyZero={isPotentiallyZero}/>) }
                          {player.scoreCard[category.id] !== null ? (<span>{player.scoreCard[category.id]}</span>) : (player.id === currentPlayerId && currentDice.length === 6 ? (<span className={(0, utils_1.cn)("text-xs font-medium", potentialScores[category.id] === 0 ? "text-red-400" : "text-main-blue")}>{potentialScores[category.id]}</span>) : null)}
                        </td>);
            })}
                  </tr>); })}

                {/* Upper Section Subtotal & Bonus */}
                <tr>
                  <td className="px-2  text-left border-b border-white/20 dark:border-zinc-800/40 font-medium text-sm text-main-blue rounded-bl-2xl">
                    Subtotal
                  </td>
                  {players.map(function (player, idx) { return (<td key={player.id} className={"border-b border-white/20 dark:border-zinc-800/40 text-center px-1 py-0.5 font-medium text-sm text-main-blue ".concat(idx === players.length - 1 ? "rounded-br-2xl" : "")}>{calculateUpperSectionSubtotal(player.scoreCard)}</td>); })}
                </tr>
                <tr>
                  <td className="px-2 text-left border-b-2 border-white/20 dark:border-zinc-800/40 font-medium text-sm text-main-blue">
                    Bonus
                  </td>
                  {players.map(function (player) { return (<td key={player.id} className="border-b-2 border-white/20 dark:border-zinc-800/40 text-center px-1 py-0.5 font-medium text-sm text-main-blue">{calculateUpperSectionBonus(player.scoreCard)}</td>); })}
                </tr>

                {availableLowerSection.map(function (category) { return (<tr key={category.id} className="transition-colors">
                    <td className="px-2 py-0.5 text-left border-b border-white/20 dark:border-zinc-800/40 font-medium text-sm text-zinc-700 dark:text-zinc-300 rounded-lg whitespace-nowrap">
                      {category.label}
                    </td>
                    {players.map(function (player) {
                var isSelectable = player.id === currentPlayerId &&
                    player.scoreCard[category.id] === null &&
                    currentDice.length === 6;
                var isPotentiallyZero = isSelectable && (potentialScores[category.id] === 0);
                var isCellFocused = (focusedCell === null || focusedCell === void 0 ? void 0 : focusedCell.playerId) === player.id && (focusedCell === null || focusedCell === void 0 ? void 0 : focusedCell.categoryId) === category.id;
                var shouldShowCallout = isSelectable && (isMobileDevice ||
                    isTablet ||
                    isCellFocused);
                var buttonPosition = getButtonPosition(category.id);
                
                return (<td key={"".concat(player.id, "-").concat(category.id)} className={(0, utils_1.cn)(
                  "border-b border-white/20 dark:border-zinc-800/40 text-center px-1 py-1 relative rounded-lg transition-all duration-150",
                  isCellFocused || isSelectable ? "bg-white/30 dark:bg-zinc-800/40 backdrop-blur-sm" : "",
                  player.id === currentPlayerId && "bg-main-blue/10 dark:bg-main-blue/20",
                  isSelectable && "cursor-pointer",
                  player.scoreCard[category.id] !== null && "text-gray-900 dark:text-zinc-100 font-medium"
                )} 
                style={{
                    overflow: 'visible',
                    position: 'relative',
                    // Add zIndex to td when it's selectable, especially for right-positioned buttons
                    zIndex: isSelectable ? (buttonPosition === 'right' ? 101000 : 100999) : 'auto'
                }}
                onClick={function (e) {
                        if (isSelectable) {
                            // If the cell is not already focused, just focus it
                            if (!isCellFocused) {
                                e.stopPropagation();
                                e.preventDefault();
                                handleCellFocus(player.id, category.id);
                            }
                            else {
                                // If already focused, select the category
                                e.stopPropagation();
                                e.preventDefault();
                                handleCategorySelect(category.id);
                            }
                        }
                    }}>
                          {/* Visual highlight for selectable cells */}
                          <SelectableHighlight isActive={isSelectable} isPotentiallyZero={isPotentiallyZero} isFocused={isCellFocused}/>
                          {/* Call-out button */}
                          {shouldShowCallout && (<CallOutButton onClick={function () { return handleCategorySelect(category.id); }} position={buttonPosition} value={potentialScores[category.id] || 0} isActive={isSelectable} isPotentiallyZero={isPotentiallyZero}/>) }
                          {player.scoreCard[category.id] !== null ? (<span>{player.scoreCard[category.id]}</span>) : (player.id === currentPlayerId && currentDice.length === 6 ? (<span className={(0, utils_1.cn)("text-xs font-medium", potentialScores[category.id] === 0 ? "text-red-400" : "text-main-blue")}>{potentialScores[category.id]}</span>) : null)}
                        </td>);
            })}
                  </tr>); })}
              </tbody>
              <tfoot>
                {/* Total - Always visible at bottom */}
                <tr className="rounded-b-2xl">
                  <td className="px-2 text-left font-bold text-sm text-bacl rounded-bl-2xl">
                    Total
                  </td>
                  {players.map(function (player, idx) { return (<td key={player.id} className={"text-center px-1 font-bold text-sm text-black ".concat(idx === players.length - 1 ? "rounded-br-2xl" : "")}>{calculateTotal(player.scoreCard)}</td>); })}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      {/* Zero Score Confirmation Dialog */}
      <alert_dialog_1.AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <alert_dialog_1.AlertDialogContent className="bg-white/80 dark:bg-zinc-900/90 rounded-2xl border-2 border-main-blue/20 backdrop-blur-xl">
          <alert_dialog_1.AlertDialogHeader>
            <alert_dialog_1.AlertDialogTitle className="text-xl text-main-blue">
              Confirm Zero Score
            </alert_dialog_1.AlertDialogTitle>
            <alert_dialog_1.AlertDialogDescription className="text-sm">
              Are you sure you want to enter a zero for this category? 
              You have other scoring options available.
            </alert_dialog_1.AlertDialogDescription>
          </alert_dialog_1.AlertDialogHeader>
          <alert_dialog_1.AlertDialogFooter>
            <alert_dialog_1.AlertDialogCancel className="bg-white/80 dark:bg-zinc-900/80 border-main-blue/20 text-gray-700 hover:bg-gray-100 rounded-full" onClick={cancelZeroScore}>
              Cancel
            </alert_dialog_1.AlertDialogCancel>
            <alert_dialog_1.AlertDialogAction className="bg-main-blue text-white hover:bg-main-blue/90 font-medium rounded-full" onClick={confirmZeroScore}>
              Enter Zero
            </alert_dialog_1.AlertDialogAction>
          </alert_dialog_1.AlertDialogFooter>
        </alert_dialog_1.AlertDialogContent>
      </alert_dialog_1.AlertDialog>
    </>);
};
exports.default = ScoreCard;