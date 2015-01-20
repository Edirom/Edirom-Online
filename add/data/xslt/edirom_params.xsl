<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" exclude-result-prefixes="xs xd" version="2.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p>
                <xd:b>Created on:</xd:b> Mar 14, 2012</xd:p>
            <xd:p>
                <xd:b>Author:</xd:b> bwb</xd:p>
            <xd:p/>
        </xd:desc>
    </xd:doc>
    <xsl:param name="ediromOnlineRoot"/>
    <xsl:param name="lang">de</xsl:param>
    <xsl:param name="includeNotes">
        <xsl:value-of select="boolean('true')"/>
    </xsl:param>
    <xsl:param name="base"/>
    <xsl:param name="pListKeyDelim">:</xsl:param>
    <xsl:param name="pageFormat"/>
    <xsl:param name="resolution">150</xsl:param>
    <xsl:param name="facsImgParas"/>
</xsl:stylesheet>