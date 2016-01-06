var COUNT = 1000;
var path = '/Users/jmakeig/Workspaces/queryconsole-upload/data/samples/';
var pad = '000000';
var text = "Sriracha YOLO disrupt, yuccie biodiesel iPhone tote bag artisan mlkshk knausgaard pitchfork salvia whatever. Kinfolk twee kogi quinoa, tousled cornhole keytar occupy hashtag cray austin fap neutra echo park yr. Pickled stumptown godard, chartreuse fashion axe single-origin coffee literally +1 yr semiotics intelligentsia actually. Photo booth ugh synth four dollar toast health goth umami. Kale chips fixie helvetica, jean shorts deep v polaroid pitchfork normcore waistcoat VHS hashtag ugh everyday carry scenester. Helvetica 3 wolf moon salvia, affogato fashion axe green juice yuccie everyday carry 90's ethical cliche. Letterpress flexitarian +1 swag cold-pressed, raw denim beard hashtag waistcoat pinterest actually. Kogi selfies craft beer bespoke, photo booth flexitarian asymmetrical retro. Echo park wayfarers vegan, viral pinterest cold-pressed try-hard hella. Gentrify chia flannel, chillwave gluten-free cardigan humblebrag helvetica hammock lo-fi kombucha. Bespoke venmo iPhone shoreditch crucifix ethical irony street art locavore, direct trade wolf hoodie. Roof party before they sold out waistcoat, tilde sartorial small batch cold-pressed stumptown typewriter. Waistcoat banjo narwhal, bushwick tilde blog YOLO ennui. 90's next level raw denim helvetica chillwave beard put a bird on it, small batch blog. Austin franzen messenger bag drinking vinegar pabst tacos. 3 wolf moon cold-pressed gluten-free tumblr irony, shabby chic heirloom wayfarers. IPhone hashtag normcore ennui. Vegan stumptown distillery, raw denim marfa blue bottle intelligentsia lumbersexual offal meditation. Pop-up art party humblebrag bushwick. Retro whatever skateboard, synth pinterest direct trade waistcoat chia tofu mlkshk hashtag irony everyday carry polaroid ennui. Skateboard freegan chicharrones, celiac pickled stumptown semiotics kitsch kombucha. Portland neutra pinterest, gentrify scenester hella bushwick dreamcatcher. Roof party distillery ugh, shabby chic tote bag disrupt cornhole fanny pack tousled viral scenester. Chartreuse yuccie locavore cardigan. Messenger bag intelligentsia single-origin coffee semiotics, scenester locavore normcore pitchfork artisan pour-over wolf photo booth viral keffiyeh bespoke. Viral YOLO post-ironic before they sold out four dollar toast. Locavore small batch retro, pitchfork art party church-key letterpress venmo bespoke chia trust fund shoreditch +1 bitters truffaut. Offal kickstarter quinoa, poutine jean shorts organic direct trade chia actually deep v chambray before they sold out.";
var sentences = text.split('\. ').map(function(s) { return s + '.'; });
for(var i = 0; i < COUNT; i++) {
  var str = (i + 1) + '';
  xdmp.save(
    path + pad.substring(0, pad.length - str.length) + str + '.json',
    {
      id: sem.uuid().toString().split(':')[2],
      description: sentences[Math.floor(Math.random() * sentences.length)],
      rate: Math.floor(Math.random() * 1000),
      isSpotOn: (0 === i % 2),
      onDate: (new Date()).toISOString()
    },
    { indent: 'yes' }
  );
  xdmp.save(
    path + pad.substring(0, pad.length - str.length) + str + '.xml',
    // FIXME: Ugly
    xdmp.unquote('<doc><id>'+sem.uuid().toString().split(':')[2]+'</id><description>'+sentences[Math.floor(Math.random() * sentences.length)]+'</description><rate>'+Math.floor(Math.random() * 1000)+'</rate><isSpotOn>'+(0 === i % 2)+'</isSpotOn><onDate>'+((new Date()).toISOString())+'</onDate></doc>').next().value.root,
    { indent: 'yes' }
  );
}
