/* The 220 Dolch sight words, in the order of the supplied list (Pre-Primer to Third Grade).
   Each entry: [word, sentence using the word]. PRON fixes words a speech engine would say wrongly. */
var GRADES = [
  {name:'Pre-Primer', words:[
    ['the','The cat sat on the mat.'],['to','We go to the park.'],['and','I like milk and cookies.'],['a','I see a big bird.'],
    ['I','I can read.'],['you','You are my friend.'],['it','Look at it fly.'],['in','The fish is in the water.'],
    ['said','Mom said hello.'],['for','This gift is for you.'],['up','The kite goes up.'],['look','Look at the moon.'],
    ['is','The sun is hot.'],['go','Let us go home.'],['we','We play in the sun.'],['little','A little bug is on me.'],
    ['down','The ball rolled down the hill.'],['can','I can jump high.'],['see','I see a red bus.'],['not','I am not sad.'],
    ['one','I have one nose.'],['my','This is my dog.'],['me','Come play with me.'],['big','A big bear sat down.'],
    ['come','Come to my house.'],['blue','The sky is blue.'],['red','I ate a red apple.'],['where','Where is my hat?'],
    ['jump','Frogs can jump.'],['away','The bird flew away.'],['here','Put it here.'],['help','Can you help me?'],
    ['make','Let us make a cake.'],['yellow','The duck is yellow.'],['two','I have two hands.'],['play','We play at the park.'],
    ['run','Dogs love to run.'],['find','I can find my shoe.'],['three','Three bugs sat on a log.'],['funny','The clown is funny.']]},
  {name:'Primer', words:[
    ['he','He has a red ball.'],['was','It was a sunny day.'],['that','I like that book.'],['she','She can sing.'],
    ['on','The cat is on the bed.'],['they','They go to school.'],['but','I am small but strong.'],['at','Look at the stars.'],
    ['with','I play with my friend.'],['all','We all clap.'],['there','The toy is over there.'],['out','The dog went out.'],
    ['be','I will be good.'],['have','I have a new pen.'],['am','I am six.'],['do','What do you see?'],
    ['did','I did my best.'],['what','What is in the box?'],['so','I am so happy.'],['get','Go get your coat.'],
    ['like','I like to swim.'],['this','This is my room.'],['will','I will help you.'],['yes','Yes, I can.'],
    ['went','We went to the zoo.'],['are','We are friends.'],['now','I want to play now.'],['no','No, it is not mine.'],
    ['came','My dad came home.'],['ride','I ride a red bike.'],['into','The cat jumped into the box.'],['good','That is a good dog.'],
    ['want','I want a snack.'],['too','I want to come too.'],['pretty','The flower is pretty.'],['four','A dog has four legs.'],
    ['saw','I saw a big frog.'],['well','She can swim well.'],['ran','The dog ran home.'],['brown','The bear is brown.'],
    ['eat','We eat lunch at noon.'],['who','Who is at the door?'],['new','I got new shoes.'],['must','We must go to bed.'],
    ['black','The cat is black.'],['white','Snow is white.'],['soon','We will eat soon.'],['our','This is our house.'],
    ['ate','We ate pizza.'],['say','Say it with me.'],['under','The cat is under the bed.'],['please','Please pass the milk.']]},
  {name:'First Grade', words:[
    ['of','I have a cup of milk.'],['his','He lost his hat.'],['had','She had a little lamb.'],['him','Give the ball to him.'],
    ['her','I like her red coat.'],['some','I want some milk.'],['as','I am as big as you.'],['then','Eat lunch, then play.'],
    ['could','I could see the moon.'],['when','When can we go?'],['were','We were at the park.'],['them','I will help them.'],
    ['ask','You can ask me.'],['an','I ate an apple.'],['over','The cow jumped over the moon.'],['just','I just got up.'],
    ['from','A gift from my mom.'],['any','Do you have any milk?'],['how','How old are you?'],['know','I know my name.'],
    ['put','Put the cup on the table.'],['take','Take my hand.'],['every','I read every day.'],['old','My dog is old.'],
    ['by','Sit by me.'],['after','After lunch, we play.'],['think','I think it is a bird.'],['let','Let me help.'],
    ['going','We are going home.'],['walk','We walk to school.'],['again','Read it again.'],['may','May I play?'],
    ['stop','Stop at the red light.'],['fly','Birds can fly.'],['round','The ball is round.'],['give','I will give you a hug.'],
    ['once','Once there was a frog.'],['open','Open the door.'],['has','She has a kitten.'],['live','Fish live in water.'],
    ['thank','I thank my mom.']]},
  {name:'Second Grade', words:[
    ['would','I would like a drink.'],['very','The sun is very hot.'],['your','Is this your coat?'],['its','The dog wags its tail.'],
    ['around','We ran around the tree.'],["don't","Don't touch the stove."],['right','Turn right at the corner.'],['green','Frogs are green.'],
    ['their','They fed their cat.'],['call','Call me at six.'],['sleep','Babies sleep a lot.'],['five','I have five fingers.'],
    ['wash','Wash your hands.'],['or','Do you want milk or juice?'],['before','Wash up before lunch.'],['been','I have been to the zoo.'],
    ['off','Turn off the light.'],['cold','Ice is cold.'],['tell','Tell me a story.'],['work','Dad goes to work.'],
    ['first','I was first in line.'],['does','Mom does the dishes.'],['goes','The bus goes fast.'],['write','I can write my name.'],
    ['always','I always say please.'],['made','I made a card.'],['gave','Gran gave me a hug.'],['us','Come play with us.'],
    ['buy','We buy milk at the store.'],['those','I like those shoes.'],['use','I use a pen to write.'],['fast','A cheetah runs fast.'],
    ['pull','Pull the wagon.'],['both','Hold it with both hands.'],['sit','Sit on the chair.'],['which','Which one do you want?'],
    ['read','I love to read books.'],['why','Why is the sky blue?'],['found','I found a shell.'],['because','I smile because I am happy.'],
    ['best','You are my best friend.'],['upon','Once upon a time.'],['these','These are my shoes.'],['sing','Let us sing a song.'],
    ['wish','Make a wish.'],['many','I have many toys.']]},
  {name:'Third Grade', words:[
    ['if','If it rains, we stay in.'],['long','The snake is long.'],['about','This book is about a bear.'],['got','I got a new bike.'],
    ['six','I am six years old.'],['never','I never give up.'],['seven','A week has seven days.'],['eight','A spider has eight legs.'],
    ['today','Today is a happy day.'],['myself','I can dress myself.'],['much','Thank you very much.'],['keep','Keep it safe.'],
    ['try','Try again.'],['start','Let us start the game.'],['ten','I can count to ten.'],['bring','Bring your book.'],
    ['drink','Drink some water.'],['only','I have only one.'],['better','I am getting better.'],['hold','Hold my hand.'],
    ['warm','The soup is warm.'],['full','My cup is full.'],['done','I am all done.'],['light','Turn on the light.'],
    ['pick','Pick a flower.'],['hurt','I hurt my knee.'],['cut','Cut the paper.'],['kind','Be kind to all.'],
    ['fall','Leaves fall from the trees.'],['carry','Can you carry my bag?'],['small','A mouse is small.'],['own','I have my own bed.'],
    ['show','Show me your drawing.'],['hot','The tea is hot.'],['far','The moon is far away.'],['draw','I like to draw.'],
    ['clean','Clean up your room.'],['grow','Seeds grow into plants.'],['together','We play together.'],['shall','Shall we dance?'],
    ['laugh','The joke made me laugh.']]}
];
var PRON = {a:'uh'};
var WORDS = [];
GRADES.forEach(function(g){ g.words.forEach(function(x){ WORDS.push({w:x[0], s:x[1], g:g.name}); }); });
var WIDX = {}; WORDS.forEach(function(x,i){ WIDX[x.w] = i; });
