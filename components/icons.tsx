import * as React from "react";
import { IconSvgProps } from "@/types";

export const Logo: React.FC<IconSvgProps> = ({
  size = 40,
  width,
  height,
  ...props
}) => (
  <svg id="svg" className="h-10 w-10 object-contain dark:fill-white">
    <path
      id="path0"
      //fill="currentColor"
      clipRule="evenodd"
      fillRule="evenodd"
      d="m18.621378903914774.021832697974787c-2.335323991397672.024653929985107-5.584353128603652.203846906630133-7.135656378891326.393663472626031-.26458043923958.032371209911616-.78772836920507.095509463156304-1.162550530691078.140408158883474-1.943063208756939.232409941304468-3.547784135680558.736115188817166-3.547784135680558,1.113542782915829,0,1.224586970761266,11.219015765516815,2.106121618634461,19.222173775487136,1.510414588700769,3.097194541065619-.230606209673169,4.527132420202179-.407995836996633,5.852840760989238-.726193517923093,3.109324426011881-.746237189379826,1.466819947359909-1.608428937326607-4.06892494587828-2.135886249009673C25.983832170314599.146506184810278,21.453893605523263-.031684761186625,19.824017542136971.004795118466063c-.198434947121314.00451009369408-.739623251862213.012126826478379-1.202638638222197.017037579508724M5.854968610490687,2.105504395283788C2.593913767412232,5.260526159535402.648445264557267,9.113379501322015.03840679914174,13.624477901899809c-.061735449760818.456199589940297-.044898508305778,4.129559078271086.020945958409357,4.590069579162446.527757937603383,3.689093778069946,1.885637206422871,6.829984654545115,4.168245439639577,9.641154306470526.311483196265726.383642019206491,1.300252709820597,1.474836192555813,1.4727312018058,1.625364822767551.051111973908519.044497654082079.30937858782363.278913950536662.573959027063211.520743973947901,1.683092645736906,1.538473740735753,4.069729323019601,3.04137137917769,5.993149519656072,3.773779704516528,4.16654131132691,1.586580387313916,8.037133768769309,1.922718278180582,12.186738047731524,1.058119898056248,2.501790299485037-.521343433718357,5.13837341020826-1.632179089953752,7.19037619836854-3.02954734105333,2.410287047383463-1.641501301077369,4.303543101234936-3.60951855201256,5.850335875520614-6.081843568699696,1.116447945412801-1.784313415979341,1.950580923633424-3.90787212653413,2.413495380542372-6.144580397991376l.182498798479173-.881634048090746-.012527485814644-2.946765311071431-.012625356797798-2.946665910853881-.190218372257732-.861188188063352c-.457002437847223-2.069039985361087-1.140203068050141-3.826796721816208-2.17437210150365-5.593773975327167-.383440160303508-.655337220134243-1.142506094617602-1.794737440277459-1.349558275938762-2.02594463895548-.030768190257731-.034275488686035-.122971831580799-.15012950010987-.204850084204736-.257364748100372-.498092958336201-.65233151049415-2.268777839943141-2.506399028779015-2.393752968206172-2.506399028779015-.023651134717511,0-.038484705567498.425232981557201-.038484705567498,1.105525773103182v1.105625555629558l.378632248266513.407694577877919c.208257217798746.224292002039874.447279567387341.497190710211726.531164175161393.606530948951331.083884607774053.109239309289478.184205423744061.231207198678931.222989859197696.270893882256132,1.072152150232796,1.098610194157118,2.651517611024246,4.197308736968807,3.203326446646315,6.285190415776924.207055239789042.783218657819816.230207844188044.885041181683846.333033545627586,1.463209425630339.84254682428309,4.738998630497008-.329825212468677,9.636743995302822-3.215456331593487,13.43317471543196-.526154404222325.692216994505543-.522545411727151.687708812354686-.941365932359076,1.160245210273388-5.390828552203857,6.080739461674057-14.335350965297948,7.965875282410707-21.919290853767961,4.619534861959437-.605428371160087-.267086853942601-1.740519209586637-.853471672752676-1.884134172395534-.973235171174565-.033072746058679-.027559857099732-.123270796849283-.081979182075884-.200439773037033-.120864546980556-2.067035159444458-1.041686748329084-5.021517368134482-4.047482025212048-6.382703940232204-6.49334823335812-.098215442911169-.176384920514465-.217777847048637-.389352179366142-.265783181866027-.473236787140195-.159048758046083-.277708914059076-.691417013912542-1.43575202721695-.812282134355883-1.766776159226538-.065343408828085-.179094723353955-.143615153962855-.379733296825179-.173981729112711-.445878788943446-.141410189533417-.30817737443158-.435054487616981-1.323304384768562-.640405013684358-2.214158185297492-1.082875904417961-4.696004213543347.136198750846233-10.265123111959838,3.073543406347198-14.041507866780194.094307102839593-.121265970933564.249246808836688-.319701682671621.344255447822434-.440967653605185.095008256677829-.121265970933564.392060070663319-.467325532695213.660048025804826-.768986840591424l.487169256792185-.548604325548695.001001648341116-1.105023802007054c.000601753621595-.607733691578687-.010823154401805-1.105024948932623-.025255301297875-1.105024948932623-.014431382280236-.000100164834294-.299557081763851.264280327045526-.633589981881414.587489308144541m1.261167015248247,3.064122559623684c.044096994745814.053116417515412.12116580609927.1400074995463.17137591419214.193123917062621.20064010270562.212766929183999.552111623976089,1.423824001171852.792037750922646,2.729588070718819.058728706693728.319701682671621.114150444627739.593202144465067.123070467180696.607734456195431.055420973317268.090498545292576.393362595815233,2.343441166043704.47403963504712,3.160533888595637.224091672373106,2.270080747402062.267988337450333,3.029747670721008.267687078330709,4.630158451309399-.000500824170558,2.545786364780724-.305169370940348,5.825481233559003-.726292918139734,7.817152677680497-.041891839161508.198433417887827-.114250609462033.568245043818024-.160652924625538.821801234371378-.092202112089581.503806176964645-.410701052134755,1.869803719567244-.507513040442973,2.176776057522147-.058328047356554.184905812964644-.224493096326114.388853649046723-.316895538083372.388853649046723-.058428212190847,0-.196631215490015.154036693255875-.165863789849027.184804883513607.036479879652688.036582338338121.460109076938352.023452334284229.539884632663416-.016735938080274.038684270619342-.019442682451881.187611028102765-.06604456266723.330925496408781-.103627020111162.361192862496864-.094506667890528,1.588786307514965-.488871676663621,2.024442166444715-.650426084795981,2.459094847799861-.911802778578931,3.207838451883617-1.235012524293779,4.330901864048428-1.869904649018281,3.113430419593897-1.760059763022582,5.085157592475298-3.787209438455648,5.711831613101822-5.872483773109707.111644794541462-.371715522395789.093205289664184-.368508718470366.442671985018933-.077671329592704.901076730542627.750145911761138,1.624965692664773,1.254654007180761,2.342739247587815,1.632683737209845.220484973728162.116154505926716.418919920849476.224390637639772.440968418221928.240426186499462.022048497372452.016136478310727.283622462356107.122769972678725.581275647654365.237019052906362.297653185299168.11425213869552.622364638908948.243135989339862.721582877086803.28633073596211.099216708943459.043292617604493.369811625931106.131186877209984.601319319111099.195426943629172.231507693180902.06424312488798.54720125325457.154039751724667.701537676395674.199537524913467.572156824667218.168772393123618,1.382635609700628.349668554256823,2.605717049482337.581475977322953,3.417801530329598.648022128777484,5.52522376257366-.070552744818087,6.768751062382762-2.307762605064454.670673144388275-1.206547360602599.866201017469393-3.254941156268615.441670336676907-4.625347480805431-.826413404441155-2.667553159883028-2.828905709113315-3.98885271873587-6.044762700043066-3.988751789284834-.879230092073158.00009940021755-2.67637072375237.238321960367102-3.510002113184783.465420871612878-2.584269541112917.704044091099604-3.61964055257522,1.262069263371814-5.569218298633132,3.002186284388699-.539082549373234.481156690586431-.501601021380338.4764466495335-.641507591476511.080176215061329-.802259151701037-2.272486232654956-3.706832893725732-5.166434856094384-7.179451349899864-7.153194400260872-.209459960424283-.11986289863944-.471033925407028-.274802604636534-.581275647654365-.344455395182194-.283722627189491-.179293523788147-1.148820302249987-.672174852283206-2.144705724420419-1.222081320674988-.253556190552445-.14000749954721-.533169765692946-.296149948169841-.621362990567832-.346860880434178-.088193989490719-.050811861714465-.548202901594777-.295147535211981-1.02224330125955-.543191601422222-.798651688440259-.417717178223029-1.01192020641156-.519139042750794-1.22268230967893-.581475977322043l-.080176215061329-.023752064169457.080176215061329.096511493806247m3.345239371892603,3.683582418343576c.804364907068702.316994938300013,3.267369241866618,1.545892055395598,3.999274449183758,1.995376778366335,2.888637593381645,1.773893214765849,4.119438606941912,3.719060649655148,4.115730214229188,6.504071222925631-.005110700389196,3.766563248759667-2.201630699482848,5.934118024609234-7.211822942120307,7.116613591157147-.24203111769566.057126069348669-.600517235820917.14892599286668-.796647627141283.204048765533116-.448584004080658.125975247369752-.440466829434627.13970471119319-.301060318891359-.505711602663723.16596395468332-.768085357084601.466323119736444-2.661839941254584.556420241075102-3.507694498915043.276607100884576-2.598902782295227.259269409181798-6.019608328196227-.042894252119368-8.438514139013932-.106633494367998-.85417512044296-.488370852492153-3.070637861542309-.581575377539593-3.377411399062112-.027260127213594-.089796626836687.015333630403802-.088293389708269.262575613323861.009221281672581m15.527066284285866.983858760525436c-.047904787676089.033572805611584-.358585518341897.196830780540949-.69031309804177.362795499841923l-.603224744810177.301762237347248.254359038461189.372516841069228c.139906570095263.204949484422286.297052196293407.448584004080658.349266365686162.541388634408577.116354835594393.207053710554646.068450047919214.215773403439925.999692450481234-.180897690368511.885041181684755-.376826222784985.832628211857809-.343654076508756.759867252987533-.48075450201577-.071454992942563-.13459554003839-.88413893356028-.979248119689146-.941365932359076-.978446801016617-.022647957143818.000301259119624-.080376544729916.028061445887033-.128281332405095.061635780733923m-2.961397023019344,1.516325843145751c-.606931608288505.31368873415795-1.064334705471083.641408191258961-1.043589115559371.747740426508244.052916087847734.271396235660177.221887281406453.821603963171583.251852623757259.820301055711752.018740763996902-.000802847906925.196431650439081-.07857357771627.394866597560394-.172879915938211s.511320833371428-.236217734233833.695224997996775-.315491701172505c.183904164624437-.079273966936853.343253417172491-.167267626760804.35407733619104-.195430002097964.017037197199897-.044497654082079-.231107033843728-.678287201013518-.361994181169393-.924327205924783l-.045901490993856-.086290093026946-.244536767782847.126377435940412m5.422298660918386,1.913698855410075c2.498080377537917.347463398673426,3.916793678320573,1.861986274805531,3.921002130586203,4.185784428729676.005009770938159,2.749631742175552-2.265872295136433,4.341524688781647-5.410671893992003,3.792820198398658-.132290984237443-.023048616480082-.447983015076716-.071656851844637-.70153920563007-.108037331279775-1.385940284608296-.198635276789901-3.025037629668077-.846756805784025-4.124650236783054-1.630977111944958-2.13368071111654-1.521739331889876-2.179782531778073-2.801145522346815-.158647334092166-4.408372099355802,1.304461162086227-1.037276437160472,2.526542482761215-1.519534176305569,4.684177116949286-1.848556540866412.230605445056426-.035076042741821,1.501392872079123-.022849816045891,1.790329422961804.017338456318612m.061233592162353,2.243121879309001c-.107236012607245.099918627398438-.108337061165003.12447353947482-.011025777920622.244536767781938.150131029343356.185205542850781.725092469364427.0976140715984.725092469364427-.110442816531759,0-.123971950688428-.170775689804941-.215872803657476-.400879546073156-.215872803657476-.171476079027343,0-.246442193481926.019542082669432-.313187145370648.081778852407297"
    />
  </svg>
);

export const DiscordIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        d="M14.82 4.26a10.14 10.14 0 0 0-.53 1.1 14.66 14.66 0 0 0-4.58 0 10.14 10.14 0 0 0-.53-1.1 16 16 0 0 0-4.13 1.3 17.33 17.33 0 0 0-3 11.59 16.6 16.6 0 0 0 5.07 2.59A12.89 12.89 0 0 0 8.23 18a9.65 9.65 0 0 1-1.71-.83 3.39 3.39 0 0 0 .42-.33 11.66 11.66 0 0 0 10.12 0q.21.18.42.33a10.84 10.84 0 0 1-1.71.84 12.41 12.41 0 0 0 1.08 1.78 16.44 16.44 0 0 0 5.06-2.59 17.22 17.22 0 0 0-3-11.59 16.09 16.09 0 0 0-4.09-1.35zM8.68 14.81a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.93 1.93 0 0 1 1.8 2 1.93 1.93 0 0 1-1.8 2zm6.64 0a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.92 1.92 0 0 1 1.8 2 1.92 1.92 0 0 1-1.8 2z"
        fill="currentColor"
      />
    </svg>
  );
};

export const TwitterIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z"
        fill="currentColor"
      />
    </svg>
  );
};

export const GithubIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        clipRule="evenodd"
        d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export const InstagramIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        clipRule="evenodd"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export const FacebookIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={size || height}
      width={size || width}
      fill="currentColor"
      className="bi bi-facebook"
      viewBox="0 0 16 16"
      {...props}
    >
      <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
    </svg>
  );
};

export const EmailIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || width}
      height={size || height}
      fill="currentColor"
      className="bi bi-envelope-fill"
      viewBox="0 0 16 16"
      {...props}
    >
      <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z" />
    </svg>
  );
};

export const PhoneIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || width}
      height={size || height}
      fill="currentColor"
      className="bi bi-telephone-fill"
      viewBox="0 0 16 16"
      {...props}
    >
      <path
        fill-rule="evenodd"
        d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"
      />
    </svg>
  );
};

export const LinkIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || width}
      height={size || height}
      fill="currentColor"
      className="bi bi-link-45deg"
      viewBox="0 0 16 16"
      {...props}
    >
      <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z" />
      <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z" />
    </svg>
  );
};

export const ClassroomIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    viewBox="2 4 20 16"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    width={size || width}
    height={size || height}
    {...props}
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <path
        d="M3 5v14a1 1 45 0 0 1 1h16a1 1 135 0 0 1-1V5a1 1 45 0 0-1-1H4a1 1 135 0 0-1 1Z"
        style={{
          opacity: 1,
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 2,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeMiterlimit: 4,
          strokeDasharray: "none",
          strokeOpacity: 1,
        }}
      ></path>
      <path
        d="M14 18h4v2h-4z"
        style={{
          opacity: 1,
          fillOpacity: 1,
          stroke: "none",
          strokeWidth: 2,
          strokeMiterlimit: 4,
          strokeDasharray: "none",
        }}
      ></path>
      <path
        d="M12 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm0 .75c-1.001 0-3 .502-3 1.5V15h6v-.75c0-.998-1.999-1.5-3-1.5z"
        style={{
          strokeWidth: 0.375,
        }}
      ></path>
      <path
        d="M15.75 10.5a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25zm0 2.813c-.17 0-.38.02-.602.058.203.235.352.537.352.879V15H18v-.563c0-.748-1.5-1.124-2.25-1.124zm-1.73.435c-.307.176-.52.407-.52.69v.062h1v-.25c0-.082-.032-.162-.168-.287a1.68 1.68 0 0 0-.312-.215zM8.25 10.5a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25zm0 2.813c-.75 0-2.25.376-2.25 1.124V15h2.5v-.75c0-.342.15-.644.352-.879a3.603 3.603 0 0 0-.602-.059zm1.73.435a1.68 1.68 0 0 0-.312.215c-.136.125-.168.205-.168.287v.25h1v-.063c0-.282-.213-.513-.52-.689z"
        style={{
          strokeWidth: 0.28125,
        }}
      ></path>
    </g>
  </svg>
);

export const YoutubeIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || width}
    height={size || height}
    fill="currentColor"
    className="bi bi-youtube"
    viewBox="0 0 16 16"
    {...props}
  >
    <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" />
  </svg>
);

export const SpotifyIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || width}
    height={size || height}
    fill="currentColor"
    className="bi bi-spotify"
    viewBox="0 0 16 16"
    {...props}
  >
    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.669 11.538a.5.5 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686m.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858m.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288" />
  </svg>
);

export const MoonFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <path d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.519.32-1.79z" />
  </svg>
);

export const SunFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <g>
      <path d="M19 12a7 7 0 11-7-7 7 7 0 017 7z" />
      <path d="M12 22.96a.969.969 0 01-1-.96v-.08a1 1 0 012 0 1.038 1.038 0 01-1 1.04zm7.14-2.82a1.024 1.024 0 01-.71-.29l-.13-.13a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.984.984 0 01-.7.29zm-14.28 0a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a1 1 0 01-.7.29zM22 13h-.08a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zM2.08 13H2a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zm16.93-7.01a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a.984.984 0 01-.7.29zm-14.02 0a1.024 1.024 0 01-.71-.29l-.13-.14a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.97.97 0 01-.7.3zM12 3.04a.969.969 0 01-1-.96V2a1 1 0 012 0 1.038 1.038 0 01-1 1.04z" />
    </g>
  </svg>
);

export const SystemThemeIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    width={24}
    height={24}
    shapeRendering="geometricPrecision"
    textRendering="geometricPrecision"
    imageRendering="optimizeQuality"
    fillRule="evenodd"
    clipRule="evenodd"
    viewBox="0 0 512 512"
    {...props}
  >
    <g>
      <path d="M 272.5,31.5 C 281.859,31.3674 288.026,35.7007 291,44.5C 291.667,65.1667 291.667,85.8333 291,106.5C 288.361,114.138 283.027,118.472 275,119.5C 267.259,118.637 261.925,114.637 259,107.5C 258.333,86.1667 258.333,64.8333 259,43.5C 261.196,36.7985 265.696,32.7985 272.5,31.5 Z" />
    </g>
    <g>
      <path d="M 109.5,98.5 C 114.412,98.0631 119.078,98.8964 123.5,101C 137.667,115.167 151.833,129.333 166,143.5C 169.978,151.616 169.145,159.116 163.5,166C 157.543,169.763 151.21,170.429 144.5,168C 129.695,154.196 115.195,140.029 101,125.5C 94.9325,113.54 97.7658,104.54 109.5,98.5 Z" />
    </g>
    <g>
      <path d="M 401.5,106.5 C 406.548,106.127 411.215,107.294 415.5,110C 462.966,158.712 484.133,217.212 479,285.5C 469.714,359.394 433.214,415.227 369.5,453C 313.744,482.346 255.744,487.679 195.5,469C 162.866,457.685 134.366,439.852 110,415.5C 103.673,403.142 106.84,394.309 119.5,389C 208.525,369.43 279.692,322.93 333,249.5C 361.548,209.389 380.548,165.056 390,116.5C 392.566,111.645 396.399,108.311 401.5,106.5 Z" />
    </g>
    <g>
      <path d="M 276.5,148.5 C 301.64,147.078 325.64,151.578 348.5,162C 311.391,244.776 251.725,305.443 169.5,344C 165.599,345.967 161.599,347.3 157.5,348C 137.335,297.149 142.835,249.315 174,204.5C 200.203,171.314 234.37,152.648 276.5,148.5 Z" />
    </g>
    <g>
      <path d="M 42.5,259.5 C 64.1692,259.333 85.8359,259.5 107.5,260C 117.915,265.479 120.748,273.646 116,284.5C 113.065,289.111 108.898,291.611 103.5,292C 82.7821,292.953 62.1154,292.62 41.5,291C 34.513,288.193 31.1797,283.027 31.5,275.5C 31.293,267.392 34.9597,262.059 42.5,259.5 Z" />
    </g>
  </svg>
);

export const HeartFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <path
      d="M12.62 20.81c-.34.12-.9.12-1.24 0C8.48 19.82 2 15.69 2 8.69 2 5.6 4.49 3.1 7.56 3.1c1.82 0 3.43.88 4.44 2.24a5.53 5.53 0 0 1 4.44-2.24C19.51 3.1 22 5.6 22 8.69c0 7-6.48 11.13-9.38 12.12Z"
      fill="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

export const SearchIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

export const NextUILogo: React.FC<IconSvgProps> = (props) => {
  const { width, height = 40 } = props;

  return (
    <svg
      fill="none"
      height={height}
      viewBox="0 0 161 32"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        className="fill-black dark:fill-white"
        d="M55.6827 5V26.6275H53.7794L41.1235 8.51665H40.9563V26.6275H39V5H40.89L53.5911 23.1323H53.7555V5H55.6827ZM67.4831 26.9663C66.1109 27.0019 64.7581 26.6329 63.5903 25.9044C62.4852 25.185 61.6054 24.1633 61.0537 22.9582C60.4354 21.5961 60.1298 20.1106 60.1598 18.6126C60.132 17.1113 60.4375 15.6228 61.0537 14.2563C61.5954 13.0511 62.4525 12.0179 63.5326 11.268C64.6166 10.5379 65.8958 10.16 67.1986 10.1852C68.0611 10.1837 68.9162 10.3468 69.7187 10.666C70.5398 10.9946 71.2829 11.4948 71.8992 12.1337C72.5764 12.8435 73.0985 13.6889 73.4318 14.6152C73.8311 15.7483 74.0226 16.9455 73.9968 18.1479V19.0773H63.2262V17.4194H72.0935C72.1083 16.4456 71.8952 15.4821 71.4714 14.6072C71.083 13.803 70.4874 13.1191 69.7472 12.6272C68.9887 12.1348 68.1022 11.8812 67.2006 11.8987C66.2411 11.8807 65.3005 12.1689 64.5128 12.7223C63.7332 13.2783 63.1083 14.0275 62.6984 14.8978C62.2582 15.8199 62.0314 16.831 62.0352 17.8546V18.8476C62.009 20.0078 62.2354 21.1595 62.6984 22.2217C63.1005 23.1349 63.7564 23.9108 64.5864 24.4554C65.4554 24.9973 66.4621 25.2717 67.4831 25.2448C68.1676 25.2588 68.848 25.1368 69.4859 24.8859C70.0301 24.6666 70.5242 24.3376 70.9382 23.919C71.3183 23.5345 71.6217 23.0799 71.8322 22.5799L73.5995 23.1604C73.3388 23.8697 72.9304 24.5143 72.4019 25.0506C71.8132 25.6529 71.1086 26.1269 70.3314 26.4434C69.4258 26.8068 68.4575 26.9846 67.4831 26.9663V26.9663ZM78.8233 10.4075L82.9655 17.325L87.1076 10.4075H89.2683L84.1008 18.5175L89.2683 26.6275H87.103L82.9608 19.9317L78.8193 26.6275H76.6647L81.7711 18.5169L76.6647 10.4062L78.8233 10.4075ZM99.5142 10.4075V12.0447H91.8413V10.4075H99.5142ZM94.2427 6.52397H96.1148V22.3931C96.086 22.9446 96.2051 23.4938 96.4597 23.9827C96.6652 24.344 96.9805 24.629 97.3589 24.7955C97.7328 24.9548 98.1349 25.0357 98.5407 25.0332C98.7508 25.0359 98.9607 25.02 99.168 24.9857C99.3422 24.954 99.4956 24.9205 99.6283 24.8853L100.026 26.5853C99.8062 26.6672 99.5805 26.7327 99.3511 26.7815C99.0274 26.847 98.6977 26.8771 98.3676 26.8712C97.6854 26.871 97.0119 26.7156 96.3973 26.4166C95.7683 26.1156 95.2317 25.6485 94.8442 25.0647C94.4214 24.4018 94.2097 23.6242 94.2374 22.8363L94.2427 6.52397ZM118.398 5H120.354V19.3204C120.376 20.7052 120.022 22.0697 119.328 23.2649C118.644 24.4235 117.658 25.3698 116.477 26.0001C115.168 26.6879 113.708 27.0311 112.232 26.9978C110.759 27.029 109.302 26.6835 107.996 25.9934C106.815 25.362 105.827 24.4161 105.141 23.2582C104.447 22.0651 104.092 20.7022 104.115 19.319V5H106.08V19.1831C106.061 20.2559 106.324 21.3147 106.843 22.2511C107.349 23.1459 108.094 23.8795 108.992 24.3683C109.993 24.9011 111.111 25.1664 112.242 25.139C113.373 25.1656 114.493 24.9003 115.495 24.3683C116.395 23.8815 117.14 23.1475 117.644 22.2511C118.16 21.3136 118.421 20.2553 118.402 19.1831L118.398 5ZM128 5V26.6275H126.041V5H128Z"
      />
      <path
        className="fill-black dark:fill-white"
        d="M23.5294 0H8.47059C3.79241 0 0 3.79241 0 8.47059V23.5294C0 28.2076 3.79241 32 8.47059 32H23.5294C28.2076 32 32 28.2076 32 23.5294V8.47059C32 3.79241 28.2076 0 23.5294 0Z"
      />
      <path
        className="fill-white dark:fill-black"
        d="M17.5667 9.21729H18.8111V18.2403C18.8255 19.1128 18.6 19.9726 18.159 20.7256C17.7241 21.4555 17.0968 22.0518 16.3458 22.4491C15.5717 22.8683 14.6722 23.0779 13.6473 23.0779C12.627 23.0779 11.7286 22.8672 10.9521 22.4457C10.2007 22.0478 9.5727 21.4518 9.13602 20.7223C8.6948 19.9705 8.4692 19.1118 8.48396 18.2403V9.21729H9.72854V18.1538C9.71656 18.8298 9.88417 19.4968 10.2143 20.0868C10.5362 20.6506 11.0099 21.1129 11.5814 21.421C12.1689 21.7448 12.8576 21.9067 13.6475 21.9067C14.4374 21.9067 15.1272 21.7448 15.7169 21.421C16.2895 21.1142 16.7635 20.6516 17.0844 20.0868C17.4124 19.4961 17.5788 18.8293 17.5667 18.1538V9.21729ZM23.6753 9.21729V22.845H22.4309V9.21729H23.6753Z"
      />
    </svg>
  );
};
