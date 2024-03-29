import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';


const style = {
  position: 'relative',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '40%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflow: 'scroll',
  height: '50%'
};

const GuideModal = (props) => {
  const {title, message} = props;

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button onClick={handleOpen} sx={{top: "-5%"}}>
        <HelpOutlinedIcon fontSize="small" sx={{color: "black"}}/>
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {title}
          </Typography>
          <hr></hr>
          <div id="modal-modal-description" sx={{ mt: 2, whiteSpace: 'pre-line'}}>
            <br/>
            {message}
          </div>
        </Box>
      </Modal>
    </div>
  );
}
export default GuideModal;
