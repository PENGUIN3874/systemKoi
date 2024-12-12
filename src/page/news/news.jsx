import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";
import "./news.scss";
import ca from "../../img/news.jpg";
import ca1 from "../../img/news2.jpg";
import CarouselNews from "../../components/carouselNews/carouselNews";
function News() {
  return (
    <>
      <Header />
      <div className="NewsPage__img">
        <img src={ca} alt="" />
      </div>
      <div className="NewsPage">
        <h1>News of Koi fish</h1>
        <div className="divider"></div>

        <div className="NewsPage__body">
          <div className="NewsPage__left">
            <iframe
              width="1000"
              height="422"
              src="https://www.youtube.com/embed/CpBp2HFD6cU"
              title='Koi: "Swimming jewels"'
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </div>

          <div className="NewsPage__right">
            <p>
              FILE - Goldfish and carp swim in a spherical water tank at an art
              aquarium exhibition in Tokyo on July 12, 2014. In recent years,
              koi have become hugely popular in Asia, with exports doubling over
              the past decade. One-fifth of the koi exported from Japan are
              shipped to China. But Beijing let expire a contract for the
              required quarantine of the fish, effectively halting the country's
              import of koi from Japan and further souring the two rivals'
              relations. (AP Photo/Koji Sasahara, File)
            </p>
            <p>
              TOKYO (AP) — What’s koi got to do with it? Souring relations
              between Asian rivals Japan and China now seem to be snagged on
              calm-inducing beauty in spas, museums and gardens. The slippery
              dispute between Asia’s two biggest economies adds to their spat
              over Japan's release into the sea of treated but radioactive water
              from the tsunami-hit Fukushima nuclear power plant. And it has
              prompted more questions than answers.
            </p>
          </div>
        </div>

        <div className="NewsPage__body2">
          <h4>WHAT ARE KOI?</h4>
          <p>
            Koi are beautifully hued and expensive carp formally called
            nishikigoi in Japan. The fish, appreciated as “swimming jewels,”
            represent good luck in life and business. They're often fixtures of
            garden ponds for wealthy and influential families in Japan. In
            recent years, koi have become hugely popular in Asia, with Japan's
            koi exports doubling over the past decade to 6.3 billion yen ($43
            million) — one-fifth of them shipped to China, the top Japanese koi
            importer, followed by the United States and Indonesia.
          </p>
          <h4>WHAT HAPPEND TO KOI EXPORTS TO CHINA?</h4>
          <p>
            Since an outbreak of koi herpes virus in Japan in the 2000s, the
            country conducts a compulsory quarantine of 7-10 days for all
            exports, including to China, to make sure the koi are disease-free.
            Initially, China had export deals with a total of 15 growers that
            also provided quarantine, allowing them to skip a separate
            quarantine process at another facility. But Beijing let many of the
            contracts expire over the years. Now, China also has not renewed the
            last remaining pre-export quarantine deal that expired Oct. 30,
            Japanese officials said. Not renewing the contract effectively ends
            China's import of koi fish from Japan. Fisheries Agency official
            Satoru Abe, in charge of koi quarantine, said China has not provided
            any explanation as to why it hasn't taken the necessary steps to
            continue koi shipments.
          </p>
        </div>

        <div className="NewsPage__img2">
          <img src={ca1} alt="" />
        </div>

        <div className="infor">
          <h4>WHAT ARE JAPANESE OFFICIALS SAYING?</h4>
          <p>
            Top Japanese officials say Tokyo submitted the necessary documents
            to facilitate koi export renewals well before the deadline, and will
            continue diplomatic efforts to resolve the deadlock. Agriculture,
            Forestry and Fisheries Minister Ichiro Miyashita told reporters,
            “Nishikigoi is culture, and fundamentally different from seafood,
            and I believe it is not related" to the Fukushima Daiichi treated
            water discharge. “But China has taken scientifically groundless
            measures, and we need to speak up and call for a withdrawal of
            practices that lack rationality and distort trade.” Chief Cabinet
            Secretary Hirokazu Matsuno said Japan will continue approaching
            Chinese authorities about taking necessary steps to resume the koi
            trade.
          </p>
          <h4>WHAT ELSE IS CAUSING TENSION BETWEEN JAPAN AND CHINA?</h4>
          <p>
            The two countries have a decadeslong dispute over a cluster of East
            China Sea islands that Japan controls and calls Senkaku, which
            Beijing also claims and calls the Diaoyu. Beijing rotates a set of
            four coast guard boats that routinely violate the Japanese-claimed
            water around the islands, adding tension with Japanese coast guard
            patrol vessels and fishing boats. Tokyo considers China to be a
            major security threat in the region and is expanding its defense
            partnerships with other Indo-Pacific nations in addition to its only
            treaty ally, the United States. Tokyo is also pushing for a military
            buildup under the new national security strategy that calls for
            counterstrike capability by long-range missiles in a break from
            Japan's postwar self-defense-only principle. Copyright 2023 The
            Associated Press. All rights reserved. This material may not be
            published, broadcast, rewritten or redistributed.
          </p>
        </div>
      </div>
      <div className="NewsPage__cr">
        <CarouselNews numberOfSlide={4} autoplay={true} />
      </div>
      <br />
      <Footer />
    </>
  );
}

export default News;
