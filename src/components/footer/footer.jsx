import ca from '../../img/footer.jpg'
import './footer.scss'
function Footer() {
  return (
    <>
    <div className='footer__information'>
      <div className='row footer__body'>
        <div className='col-md-6 footer__body__left'>
            <h3>Royal Koi</h3>
            <p><b>Address:</b> House No. 30/2, Road No. 587, Don Hamlet - Trung Lap Ha Commune</p>
            <p><b>Hotline:</b> 0909.69.79.99</p>
            <p><b>Email:</b> royalkoi1979@gmail.com</p>
            <p><b>Website:</b> https://royalkoi.com/</p>
        </div>

        <div className='col-md-6 footer__body__right'>
          <p>Contact now</p>
          <h5>Royal Koi</h5>
          <h5>Call us whenever you need</h5>
          <h5>0909.67.88.99 - 0969.67.87.99</h5>
        </div>

      </div>
    </div>
    <div className='footer'>
        <h3>©2024 by Royal Koi</h3>
    </div>
    </>
  )
}

export default Footer;